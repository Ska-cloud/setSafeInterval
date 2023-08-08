# setSafeInterval
一个安全的执行异步任务的定时器
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
