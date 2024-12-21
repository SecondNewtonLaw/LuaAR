use std::process::Command;
use tauri::command;
use tauri::path::BaseDirectory;
use tauri::AppHandle;
use tauri::Manager;

#[cfg(not(target_os = "android"))]
use tauri_plugin_updater;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[cfg(not(target_os = "android"))]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())

        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            format_code,
            lint_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[cfg(target_os = "android")]
pub fn run_android() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
fn format_code(app_handle: AppHandle, lua_code: String) -> Result<String, String> {
    let stylua_path = app_handle
        .path()
        .resolve("assets/stylua.exe", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
    println!("Stylua path: {:?}", stylua_path);
    let config_path = stylua_path.parent().unwrap().join("stylua.toml");

    let output = Command::new(stylua_path)
        .arg("--config-path")
        .arg(config_path)
        .arg("-")
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .spawn()
        .and_then(|mut child| {
            use std::io::Write;
            if let Some(stdin) = child.stdin.as_mut() {
                stdin.write_all(lua_code.as_bytes())?;
            }
            child.wait_with_output()
        });

    match output {
        Ok(output) if output.status.success() => {
            let formatted_code = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;

            Ok(formatted_code)
        }
        Ok(output) => {
            let error_message = String::from_utf8_lossy(&output.stderr).to_string();
            println!("Formatting error: {}", error_message);
            Err(error_message)
        }
        Err(e) => {
            println!("Command execution error: {}", e);
            Err(e.to_string())
        }
    }
}

#[command]
fn lint_code(app_handle: AppHandle, lua_code: String) -> Result<String, String> {
    let selene_path = app_handle
        .path()
        .resolve("assets/selene.exe", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;

    let config_path = selene_path.parent().unwrap().join("selene.toml");
    println!("Selene config path: {:?}", config_path);

    let output = Command::new(selene_path)
        .arg("--config")
        .arg(config_path)
        .arg("--display-style=Rich")
        .arg("-") // Read from stdin
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .and_then(|mut child| {
            use std::io::Write;
            if let Some(stdin) = child.stdin.as_mut() {
                stdin.write_all(lua_code.as_bytes())?;
            }
            child.wait_with_output()
        });

    match output {
        Ok(output) => {
            // Selene returns non-zero exit code for lint warnings
            // so we always want to capture the output
            let stdout = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
            let stderr = String::from_utf8(output.stderr).map_err(|e| e.to_string())?;

            if !stderr.is_empty() {
                println!("Linting stderr: {}", stderr);
                return Err(stderr);
            }

            Ok(stdout)
        }
        Err(e) => {
            println!("Command execution error: {}", e);
            Err(e.to_string())
        }
    }
}

