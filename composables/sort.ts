const _quickSort = <T>(arr: T[], compareFn: (a: T, b: T) => number, _left: number, _right: number): T[] => {
	if (arr.length <= 1) {
		return arr
	}

	const pivot = arr[arr.length - 1]
	const leftArr: T[] = []
	const rightArr: T[] = []

	for (let i = 0; i < arr.length - 1; i++) {
		if (compareFn(arr[i], pivot) < 0) {
			leftArr.push(arr[i])
		} else {
			rightArr.push(arr[i])
		}
	}

	const sortedLeft = _quickSort(leftArr, compareFn, 0, leftArr.length - 1)
	const sortedRight = _quickSort(rightArr, compareFn, 0, rightArr.length - 1)

	return [...sortedLeft, pivot, ...sortedRight]
}

export function quickSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
	const start = performance.now()
	const res = _quickSort(arr, compareFn, 0, arr.length - 1)
	console.log(`quickSort took ${performance.now() - start}ms`)
	return res
}
