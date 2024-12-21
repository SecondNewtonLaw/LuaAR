// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(not(target_os = "android"))]
fn main() {
    app_lib::run();
}

#[cfg(target_os = "android")]
fn main() {
    app_lib::run_android();
}
