import { useEffect, useRef, useState } from "react";


/**
 * setSafeInterval提供一个安全的执行异步任务的计时器，无需考虑清除计时器，也无需考虑，异步任务覆盖的问题。
 * @param callback 异步函数
 * @param timeout 倒计时时间
 * @param paused 该参数为选择传递参数，传递一个布尔值，默认为false，当需要暂停异步任务时传入true（不会终止定时器计时，只是不继续做异步任务）
 * @example
 *  正常工作时
 *    setSafeInterval(async () => {
 *      await refreshAlertNum()
 *   }, 1000)
 *   需要暂停时
 *     setSafeInterval(async () => {
 *    await refreshAlertNum()
 *   }, 1000, true)
 */
const setSafeInterval = (callback: () => Promise<void>, timeout: number, paused: boolean = false) => {

	const setIntervalTrigger = _safeIntervalTrigger(callback, paused)

	_setSafeInterval(() => {
		setIntervalTrigger(true)
	}, timeout)

}
export default setSafeInterval;

/**
 * @param callback 异步回调函数，返回一个 Promise。
 * @param timeout 间隔时间的延迟（毫秒）。
 * @warnning 使用方式与setInterval一致，传入一个函数和一个延时时间，但是调用位置与useEffect一致，并且不能在useEffect中使用
 * @note
 *  _setSafeInterval函数用于，安全的设置一个异步任务的定时器任务。_setSafeInterval接收两个参数，
 *  一个是回调函数，即要执行的任务；第二个参数是计时的时间。使用_setSafeInterval时不用考虑清除定时器
 *  组件卸载时，_setSafeInterval会自动清除定时器。
 */
const _setSafeInterval = (callback: () => void, timeout: number) => {
	let savedCallback = useRef<any>(null);
	let timeoutRef = useRef<NodeJS.Timeout | null>(null);  // 存储定时器的钩子
	let unmountedRef = useRef<boolean>(false);   // 记录组件是否卸载的钩子

	// 确保能拿到最新的回调函数
	useEffect(() => {
		savedCallback.current = callback;
	}, [savedCallback.current]);

	// 可以动态指定延时时间
	useEffect(() => {

		// 避免重复创建
		if (timeoutRef.current === null) {
			timeoutRef.current = setInterval(() => {
				// 若组件未卸载执行
				if (!unmountedRef.current) {
					savedCallback.current()
				}
			}, timeout)
		}

		return () => {
			unmountedRef.current = true  // 组件卸载时设置为true
			// 定时器被创建的情况下，若组件卸载清除定时器
			if (timeoutRef.current !== null) {
				clearInterval(timeoutRef.current)
			}
		}

	}, [timeout]);
};

/**
 * 该hook作为一个触发器，主要功能是保证在定时器的异步任务，不会覆盖执行，即无论上一个计时周期是否结束，必须做完上一个周期的异步任务后，才能做下一个异步任务
 * @param asyncFunc 定时器需要执行的异步任务
 * @param paused 该参数为选择传递参数，传递一个布尔值，默认为false，当需要暂停异步任务时传入true（不会终止定时器计时，只是不继续做异步任务）
 */
const _safeIntervalTrigger = (asyncFunc: () => Promise<void>, paused: boolean = false) => {
	let [intervalTrigger, setIntervalTrigger] = useState<boolean>(false)
	let [ready, setReady] = useState<boolean | undefined>(undefined)

	// ready=undefined，初始化ready为true
	useEffect(() => {
		if (ready === undefined) {
			setReady(() => ready = true)
		}
	}, []);

	// trigger状态发生变化时，执行该逻辑，
	useEffect(() => {
    if (!paused) {
      if (intervalTrigger) {
        // 还原trigger的状态
        setIntervalTrigger(() => intervalTrigger = false)
        // 只有ready时，即上一次的异步任务已完成，才执行下一次异步函数
        if (ready) {

          // 异步任务开始，ready置为false
          setReady(() => ready = false)
          asyncFunc()
            // 异步任务结束，ready置为true
            .then(() => {
              setReady(true)
            })
            .catch((errors) => {
              setReady(true)
            })
        }
      }
    }
	}, [intervalTrigger, paused]);
	return setIntervalTrigger
};
