(() => {
  const workingHours = 8;
  const localStorageKey = "saved-work-times";
  const stepsInfo = {
    start: {
      btnText: "Start",
      itemId: "start",
      next: "lunchStart",
    },
    lunchStart: {
      btnText: "Lunch",
      itemId: "lunch-start",
      next: "lunchEnd",
    },
    lunchEnd: {
      btnText: "Work again",
      itemId: "lunch-end",
      next: "finish",
    },
    finish: {
      btnText: "Reset",
      itemId: "finish",
    },
  };

  function getUserDate(date) {
    const newDate = new Date(date);
    return `${newDate.getHours().toString().padStart(2, "0")}:${newDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${newDate.getSeconds().toString().padStart(2, "0")}`;
  }

  function next() {
    const times = getTimes();
    console.log(times);
    const step = getStep(times);
    if (step === "done") return;
    changeBtnText(nextId(step));
    const newTime = new Date();
    const item = document.getElementById(getItemId(step));
    item.innerText = getUserDate(newTime);
    times[step] = newTime;
    setTimes(times);
    if (step === "lunchEnd") {
      end();
    }
  }

  function changeBtnText(step) {
    console.log(step);
    const btn = document.getElementById("action-btn");
    btn.innerText = getBtnText(step);
  }

  function nextId(key) {
    return stepsInfo[key].next;
  }
  function getItemId(key) {
    return stepsInfo[key].itemId;
  }

  function getBtnText(key) {
    return stepsInfo[key].btnText;
  }

  function setTimes(newTimes) {
    localStorage.setItem(localStorageKey, JSON.stringify(newTimes));
  }

  function getTimes() {
    const times = JSON.parse(localStorage.getItem(localStorageKey));
    return times
      ? times
      : {
          start: undefined,
          lunchStart: undefined,
          lunchEnd: undefined,
        };
  }

  function getStep(times) {
    const t = times ?? getTimes();
    if (!t.start) return "start";
    if (!t.lunchStart) return "lunchStart";
    if (!t.lunchEnd) return "lunchEnd";
    return "done";
  }

  function setTimeTexts() {
    const times = getTimes();
    const stepInfos = Object.entries(stepsInfo);
    for (let [key, { itemId }] of stepInfos) {
      const item = document.getElementById(itemId);
      item.innerText = times[key] ? getUserDate(times[key]) : "";
    }
  }
  function calculateExitTime() {
    const times = getTimes();
    const start = new Date(times.start);
    const lunchStart = new Date(times.lunchStart);
    const lunchEnd = new Date(times.lunchEnd);
    const miliseconds =
      workingHours * 3_600_000 +
      start.getTime() -
      lunchStart.getTime() +
      lunchEnd.getTime();
    return new Date(miliseconds);
  }

  function reset() {
    localStorage.removeItem("saved-work-times");
    init();
  }

  function end() {
    const btn = document.getElementById("action-btn");
    const finishItem = document.getElementById(stepsInfo.finish.itemId);
    btn.classList.add("action-btn-done");
    btn.removeEventListener("click", next);
    btn.innerText = stepsInfo.finish.btnText;
    finishItem.innerText = getUserDate(calculateExitTime());
    btn.addEventListener("click", reset);
    return;
  }

  function init() {
    const step = getStep();
    setTimeTexts();
    if (step === "done") {
      return end();
    }
    const btn = document.getElementById("action-btn");
    changeBtnText(step);
    btn.removeEventListener("click", reset);
    btn.addEventListener("click", next);
  }
  init();
})();
