(() => {
  const workingHours = 8;
  const lunchMinutes = 45;
  let interval;
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
    const step = getStep(times);
    if (step === "done") return;
    if (step === "lunchStart") {
      interval = setInterval(lunchTimer, 1000);
    }
    if (step === "lunchEnd") {
      clearInterval(interval);
    }
    changeBtnText(nextId(step));
    const newTime = new Date();
    const item = document.getElementById(getItemId(step));
    item.innerText = getUserDate(newTime);
    times[step] = newTime;
    setTimes(times);
    if (step === "lunchStart") {
      showLunchReturnTime();
    }
    if (step === "lunchEnd") {
      end();
    }
  }

  function changeBtnText(step) {
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
    const milliseconds =
      workingHours * 3_600_000 +
      start.getTime() -
      lunchStart.getTime() +
      lunchEnd.getTime();
    return new Date(milliseconds);
  }

  function showLunchReturnTime() {
    const times = getTimes();
    let el = document.getElementById("lunch-return");

    // Si no hay comida iniciada (p. ej. tras Reset), quitamos el aviso
    if (!times.lunchStart) {
      if (el) el.remove();
      return;
    }

    // Si no existe el elemento, lo creamos debajo de la hora de "Lunch"
    if (!el) {
      el = document.createElement("div");
      el.id = "lunch-return";
      document
        .getElementById(stepsInfo.lunchStart.itemId)
        .insertAdjacentElement("afterend", el);
    }

    const back = new Date(
      new Date(times.lunchStart).getTime() + lunchMinutes * 60_000
    );
    el.innerText = `Vuelve a las ${getUserDate(back)}`;
  }

  function reset() {
    localStorage.removeItem("saved-work-times");
    clearInterval(interval);
    const spent = document.getElementById("lunch-spent");
    if (spent) spent.innerText = "";
    document.getElementById("action-btn").classList.remove("action-btn-done");
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

  function getSeconds(date1, date2) {
    const totalSeconds1 =
      date1.getSeconds() + date1.getMinutes() * 60 + date1.getHours() * 3600;
    const totalSeconds2 =
      date2.getSeconds() + date2.getMinutes() * 60 + date2.getHours() * 3600;
    const sec = Math.abs(totalSeconds1 - totalSeconds2);
    return {
      hours: sec / 3600,
      minutes: (sec % 3600) / 60,
      seconds: (sec % 3600) % 60,
    };
  }

  function lunchTimer() {
    const times = getTimes();
    const lunchStart = new Date(times.lunchStart);
    const actualTime = new Date();
    const timeSpent = getSeconds(lunchStart, actualTime);
    const timeContainer = document.getElementById("lunch-spent");
    timeContainer.innerText = getUserDate(
      new Date(
        2023,
        0,
        1,
        timeSpent.hours,
        timeSpent.minutes,
        timeSpent.seconds
      )
    );
  }

  function init() {
    const step = getStep();
    setTimeTexts();
    showLunchReturnTime();

    // Evita intervalos duplicados (p. ej. tras un Reset)
    clearInterval(interval);

    // Si estás en plena comida (Lunch pulsado, "Work again" aún no),
    // reactiva el contador al recargar la página
    if (step === "lunchEnd") {
      lunchTimer(); // pinta el tiempo ya, sin esperar 1 segundo
      interval = setInterval(lunchTimer, 1000);
    }

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
