(function ($) {
  console.clear();

  toastr.options = {
    closeButton: true,
    debug: true,
    positionClass: "toast-bottom-full-width",
    onclick: null,
    showDuration: "30000",
    hideDuration: "30000",
    timeOut: "0",
    extendedTimeOut: "0",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
    progressBar: "true",
    preventDuplicates: "true"
  };

  window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    toastr.error(
      "Error occurred. Please press F12, navigate to console, and paste all information to Wollus: \n" +
        errorMsg
    );
    return false;
  };
  
  $(window).resize(function() {
    document.querySelector('.tab-content').style.height = "87vh";
  });

  const resinInputs = document.querySelectorAll(".current-resin,.remaining-resin-refill-time");
  resinInputs.forEach(function (element) {
    element.addEventListener("change", (event) => {
      let taskNameSpanElement = element.parentNode.querySelector(".task-name");
      let taskName = taskNameSpanElement.innerText;
      let timerType = taskNameSpanElement.getAttribute("timer-type");

      switch (timerType) {
        case "resin":
          setResinTimer(taskName, taskNameSpanElement);
          break;
        case "default":
          throw "Unexpected timerType for number input!";
          break;
      }
      updatePage();
    });
  });

  const remainingResinRefillInput = document.querySelectorAll(
    "input.remaining-resin-refill-time"
  );
  remainingResinRefillInput.forEach(function (element) {
    element.addEventListener("change", (event) => {
      let taskNameSpanElement = element.parentNode.querySelector(".task-name");
      let taskName = taskNameSpanElement.innerText;

      const timeArray = element.value.split(":");
      const hours = timeArray[0];
      const minutes = timeArray[1];
      const seconds = timeArray[2];
      const unixTimeToFullRefill =
        (hours * 3600000 + minutes * 60000 + seconds * 1000);
      
      const nowDate = new Date();
      const resinFullDate = new Date(nowDate.getTime() + unixTimeToFullRefill);

      localStorage.setItem(taskName, resinFullDate.getTime());
      
      element.value = "";
      
      updatePage();
    });
  });
  
  const ltuidInput = document.querySelectorAll(
    "input.ltuid-input"
  );
  ltuidInput.forEach(function (element) {
    element.addEventListener("change", (event) => {
      localStorage.setItem("ltuid", element.value);
      element.value = "";
      updatePage();
    });
  });

  const ltokenInput = document.querySelectorAll(
    "input.ltoken-input"
  );
  ltokenInput.forEach(function (element) {
    element.addEventListener("change", (event) => {
      localStorage.setItem("ltoken", element.value);
      element.value = "";
      updatePage();
    });
  });

  const uidInput = document.querySelectorAll(
    "input.uid-input"
  );
  uidInput.forEach(function (element) {
    element.addEventListener("change", (event) => {
      localStorage.setItem("uid", element.value);
      element.value = "";
      updatePage();
    });
  });

  const bpSilenceInput = document.querySelectorAll(
    "input.bp-silence"
  );
  bpSilenceInput.forEach(function (element) {
    element.addEventListener("change", (event) => {
      // now
      // add days to now
      // set daily reset to that new time
      // set weekly reset to that new time
      const daysToSilence = element.value;
      const unixTimeToSilence =
        (daysToSilence * 24 * 60 * 60 * 1000);
      
      const nowDate = new Date();
      const resinFullDate = new Date(nowDate.getTime() + unixTimeToSilence);

      localStorage.setItem("BP (daily)", resinFullDate.getTime());
      localStorage.setItem("BP (weekly)", resinFullDate.getTime());
      
      element.value = "";
      
      updatePage();
    });
  });

  const checkboxes = document.querySelectorAll("input[type='checkbox'].timed");
  checkboxes.forEach(function (element) {
    element.addEventListener("change", (event) => {
      var taskNameSpanElement = element.parentNode.querySelector(".task-name");
      var taskName = taskNameSpanElement.innerText;
      var timerType = taskNameSpanElement.getAttribute("timer-type");
      if (event.currentTarget.checked) {
        switch (timerType) {
          case "weekly":
            setWeeklyTimer(taskName);
            break;
          case "daily":
            setDailyTimer(taskName, taskNameSpanElement);
            break;
          case "fixed":
            setFixedTimer(taskName, taskNameSpanElement);
            break;
          case "commission":
            setDailyTimer(taskName, taskNameSpanElement);
            localStorage.setItem("commissionsCount", 4)
            break;
          case "request":
            setWeeklyTimer(taskName, taskNameSpanElement);
            localStorage.setItem("requestsCount", 3)
            break;
          case "bounty":
            setWeeklyTimer(taskName, taskNameSpanElement);
            localStorage.setItem("bountiesCount", 3)
            break;
          default:
            throw "No timer set for element. Probably a bug in the HTML.";
            break;
        }
      } else {
        switch (timerType) {
          case "commission":
            localStorage.setItem("commissionsCount", 0)
            break;
          case "request":
            localStorage.setItem("requestsCount", 0)
            break;
          case "bounty":
            localStorage.setItem("bountiesCount", 0)
            break;
          default:
            break;
        }
        localStorage.removeItem(taskName);
      }
      updatePage();
    });
  });

  function setWeeklyTimer(taskName) {
    var dailyResetDate = new Date();
    dailyResetDate.setHours(1);
    dailyResetDate.setMinutes(0);
    dailyResetDate.setSeconds(0);

    var nowDate = new Date();

    dailyResetDate.setDate(dailyResetDate.getDate() + 1);
    dailyResetDate.setDate(
      dailyResetDate.getDate() + ((1 + 7 - dailyResetDate.getDay()) % 7)
    );

    localStorage.setItem(taskName, dailyResetDate.getTime());
  }

  function setDailyTimer(taskName, taskNameSpanElement) {
    let timerResetTime = parseInt(
      taskNameSpanElement.getAttribute("timer-reset-time")
    );
    if (timerResetTime === null || isNaN(timerResetTime)) {
      timerResetTime = 1;
    }
    
    var dailyResetDate = new Date();
    dailyResetDate.setHours(timerResetTime);
    dailyResetDate.setMinutes(0);
    dailyResetDate.setSeconds(0);

    var nowDate = new Date();

    if (dailyResetDate - nowDate < 0) {
      dailyResetDate.setDate(dailyResetDate.getDate() + 1);
    }

    localStorage.setItem(taskName, dailyResetDate.getTime());
  }

  function setFixedTimer(taskName, taskNameSpanElement) {
    var fixedResetDate = new Date();
    const timerDurationInDays = parseInt(
      taskNameSpanElement.getAttribute("timer-duration-days")
    );
    if (timerDurationInDays !== null && !isNaN(timerDurationInDays)) {
      fixedResetDate.setDate(fixedResetDate.getDate() + timerDurationInDays);
    }
    const timerDurationInHours = parseInt(
      taskNameSpanElement.getAttribute("timer-duration-hours")
    );
    if (timerDurationInHours !== null && !isNaN(timerDurationInHours)) {
      fixedResetDate.setHours(fixedResetDate.getHours() + timerDurationInHours);
    }

    localStorage.setItem(taskName, fixedResetDate.getTime());
  }

  function setResinTimer(taskName, taskNameSpanElement) {
    let fixedResetDate = new Date();
    const currentResin = parseInt(
      taskNameSpanElement.parentNode.parentNode.querySelector(".current-resin")
        .value
    );
    const resinToHitCap = 160 - currentResin;
    const minutesToHitCap = (resinToHitCap) * 8;

    fixedResetDate = new Date(
      fixedResetDate.getTime() + minutesToHitCap * 60 * 1000
    );

    localStorage.setItem(taskName, fixedResetDate.getTime());
    updatePage();
  }

  var myInterval;
  var focusedIntervalDelay = 4000;
  var blurredIntervalDelay = 60000;
  var is_interval_running = false; //Optional

  var genshinStatsInterval;
  var isGenshinStatsIntervalRunning = false; //Optional

  $(window)
    .focus(function () {
      console.log("Triggered onFocus()");
      updatePage();
      setUpInterval(focusedIntervalDelay);
      setUpGenshinResinInvokeInterval(blurredIntervalDelay * 10);
    })
    .blur(function () {
      console.log("Triggered onBlur()");
      tearDownInterval();
      setUpInterval(blurredIntervalDelay);
    });

  function setUpInterval(intervalDelay) {
    console.log("Called setUpInterval()");
    clearInterval(myInterval); // Clearing interval if for some reason it has not been cleared yet
    if (!is_interval_running) {
      //Optional
      myInterval = setInterval(interval_function, intervalDelay);
    }
  }

  function setUpGenshinResinInvokeInterval(intervalDelay) {
    console.log("Called setUpGenshinResinInvokeInterval()");
    getGenshinStatsData();
    clearInterval(genshinStatsInterval); // Clearing interval if for some reason it has not been cleared yet
    if (!isGenshinStatsIntervalRunning) {
      //Optional
      myInterval = setInterval(genshinStatsIntervalFunction, intervalDelay);
    }
  }

  function tearDownInterval() {
    console.log("Called tearDownInterval()");
    clearInterval(myInterval); // Clearing interval on window blur
    is_interval_running = false; //Optional
    // TODO: make timer grey or something to signify that it is not in focus. Maybe add an info button => better yet, giant "IDLE" 'light' as would exist in a plane, but less terrible than 'stall'
  }

  interval_function = function () {
    is_interval_running = true; //Optional
    // Code running while window is in focus
    updatePage();
  };

  genshinStatsIntervalFunction = function () {
    is_interval_running = true; //Optional
    // Code running while window is in focus
    getGenshinStatsData();
  };

  function updatePage() {
    console.log("Called updatePage()");
    document.querySelectorAll(".timer").forEach(function (timerElement) {
      // Get today's date and time
      var now = new Date().getTime();
      var inputElement = timerElement.parentNode.querySelector("input.timed");
      if (inputElement === null) {
        return;
      }
      var taskName = timerElement.parentNode.querySelector(".task-name")
        .innerText;
      var countDownDate = localStorage.getItem(taskName);
      
      let completedCommissionsInput = timerElement.parentNode.querySelector(
        ".completed-commissions"
      );
      let completedRequestsInput = timerElement.parentNode.querySelector(
        ".completed-requests"
      );
      let completedBountiesInput = timerElement.parentNode.querySelector(
        ".completed-bounties"
      );
        
      if (completedCommissionsInput !== null) {
        let commissionsCount = localStorage.getItem("commissionsCount");
        if (commissionsCount === null || isNaN(commissionsCount) || commissionsCount === 0) {
          completedCommissionsInput.value = 0;
          localStorage.setItem("commissionsCount", 0);
        }
      }
        
      if (completedRequestsInput !== null) {
        let requestsCount = localStorage.getItem("requestsCount");
        if (requestsCount === null || isNaN(requestsCount) || requestsCount === 0) {
          completedRequestsInput.value = 0;
          localStorage.setItem("requestsCount", 0);
        }
      }
        
      if (completedBountiesInput !== null) {
        let bountiesCount = localStorage.getItem("bountiesCount");
        if (bountiesCount === null || isNaN(bountiesCount) || bountiesCount === 0) {
          completedBountiesInput.value = 0;
          localStorage.setItem("bountiesCount", 0);
        }
      }
      
      let currentResinInput = timerElement.parentNode.querySelector(
        ".current-resin"
      );
      
      if (currentResinInput === null && (countDownDate == null || countDownDate <= 0 || countDownDate - now < 0)) {
        inputElement.checked = false;
        timerElement.innerHTML = "";
        
        if (completedCommissionsInput !== null) {
          localStorage.setItem("commissionsCount", 0);
          completedCommissionsInput.value = 0;
          localStorage.setItem("Commissions", null);
        }
        
        if (completedRequestsInput !== null) {
          localStorage.setItem("requestsCount", 0);
          completedRequestsInput.value = 0;
        }
        
        if (completedBountiesInput !== null) {
          localStorage.setItem("bountiesCount", 0);
          completedBountiesInput.value = 0;
        }
        
        return;
      }

      let remainingTimeInMs = countDownDate - now;
      console.log();
      if (currentResinInput !== null) {
        if (remainingTimeInMs < 0) {
          remainingTimeInMs = 0;
        }
        let remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
        let resinToHitCap = remainingTimeInMinutes / 8;
        let currentResin = Math.trunc(160 - resinToHitCap);
        currentResinInput.value = Math.min(currentResin, 160);
        if (currentResin >= 160) {
          inputElement.checked = false;
        } else {
          inputElement.checked = true;
        }
        
        let twentyResinTimer = document.querySelector(".resin-at.twenty");
        if (resinToHitCap < 140) {
          twentyResinTimer.innerText = '✓';
        } else {
          let remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
          let minutesToHitTwenty = remainingTimeInMinutes - 140*8;
          let dateToHitTwenty = new Date(now + minutesToHitTwenty*60*1000);
          twentyResinTimer.innerText = formatAMPM(dateToHitTwenty);
        }
        
        let fortyResinTimer = document.querySelector(".resin-at.forty");
        if (resinToHitCap < 120) {
          fortyResinTimer.innerText = '✓';
        } else {
          let remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
          let minutesToHitForty = remainingTimeInMinutes - 120*8;
          let dateToHitForty = new Date(now + minutesToHitForty*60*1000);
          fortyResinTimer.innerText = formatAMPM(dateToHitForty);
        }
        
        let sixtyResinTimer = document.querySelector(".resin-at.sixty");
        if (resinToHitCap < 100) {
          sixtyResinTimer.innerText = '✓';
        } else {
          let remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
          let minutesToHitSixty = remainingTimeInMinutes - 100*8;
          let dateToHitSixty = new Date(now + minutesToHitSixty*60*1000);
          sixtyResinTimer.innerText = formatAMPM(dateToHitSixty);
        }
        
        let eightyResinTimer = document.querySelector(".resin-at.eighty");
        if (resinToHitCap < 80) {
          eightyResinTimer.innerText = '✓';
        } else {
          let remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
          let minutesToHitEighty = remainingTimeInMinutes - 80*8;
          let dateToHitEighty = new Date(now + minutesToHitEighty*60*1000);
          eightyResinTimer.innerText = formatAMPM(dateToHitEighty);
        }
        
        let oneTwentyResinTimer = document.querySelector(".resin-at.one-twenty");
        if (resinToHitCap < 40) {
          oneTwentyResinTimer.innerText = '✓';
        } else {
          let remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
          let minutesToHitOneTwenty = remainingTimeInMinutes - 40*8;
          let dateToHitOneTwenty = new Date(now + minutesToHitOneTwenty*60*1000);
          oneTwentyResinTimer.innerText = formatAMPM(dateToHitOneTwenty);
        }
        
        let oneFiftyResinTimer = document.querySelector(".resin-at.one-fifty");
        if (resinToHitCap < 10) {
          oneFiftyResinTimer.innerText = '✓';
        } else {
          let remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
          let minutesToHitOneFifty = remainingTimeInMinutes - 10*8;
          let dateToHitOneFifty = new Date(now + minutesToHitOneFifty*60*1000);
          oneFiftyResinTimer.innerText = formatAMPM(dateToHitOneFifty);
        }
        
        let oneSixtyResinTimer = document.querySelector(".resin-at.one-sixty");
        if (resinToHitCap <= 0) {
          oneSixtyResinTimer.innerText = '✓';
        } else {
          let remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
          let minutesToHitOneSixty = remainingTimeInMinutes;
          let dateToHitOneSixty = new Date(now + minutesToHitOneSixty*60*1000);
          oneSixtyResinTimer.innerText = formatAMPM(dateToHitOneSixty);
        }
        console.log(JSON.stringify(localStorage));
        
        let twoHundredResinTimer = document.querySelector(".resin-at.two-hundred");
        remainingTimeInMinutes = remainingTimeInMs / 1000 / 60;
        let minutesToHitTwoHundred = remainingTimeInMinutes + 40*8;
        let dateToHitTwoHundred = new Date(now + minutesToHitTwoHundred*60*1000);
        twoHundredResinTimer.innerText = formatAMPM(dateToHitTwoHundred);
      } else if (completedCommissionsInput !== null) {
        const commissionsCount = localStorage.getItem("commissionsCount");
        completedCommissionsInput.value = commissionsCount;
        if (completedCommissionsInput.value === null) {
          completedCommissionsInput.value = 0;
        }
        let completedCommissions = parseInt(completedCommissionsInput.value);
        if (completedCommissions >= 4) {
          inputElement.checked = true;
        } else {
          localStorage.setItem(taskName, null);
          remainingTimeInMs = 0;
          inputElement.checked = false;
        }
      } else if (completedRequestsInput !== null) {
        const requestsCount = localStorage.getItem("requestsCount");
        completedRequestsInput.value = requestsCount;
        if (completedRequestsInput.value === null) {
          completedRequestsInput.value = 0;
        }
        let completedRequests = parseInt(completedRequestsInput.value);
        if (completedRequests >= 3) {
          inputElement.checked = true;
        } else {
          localStorage.setItem(taskName, null);
          remainingTimeInMs = 0;
          inputElement.checked = false;
        }
      } else if (completedBountiesInput !== null) {
        const bountiesCount = localStorage.getItem("bountiesCount");
        completedBountiesInput.value = bountiesCount;
        if (completedBountiesInput.value === null) {
          completedBountiesInput.value = 0;
        }
        let completedBounties = parseInt(completedBountiesInput.value);
        if (completedBounties >= 3) {
          inputElement.checked = true;
        } else {
          localStorage.setItem(taskName, null);
          remainingTimeInMs = 0;
          inputElement.checked = false;
        }
      } else {
        // Check box if we've made it this far and we're not a resin/commissions/requests/bounties input.
        inputElement.checked = true;
      }

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(remainingTimeInMs / (1000 * 60 * 60 * 24)); // TODO: Update vars to const or let
      var hours = Math.floor(
        (remainingTimeInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor(
        (remainingTimeInMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      var seconds = Math.floor((remainingTimeInMs % (1000 * 60)) / 1000);

      // If the count down is finished, clear timer
      if (remainingTimeInMs <= 0) {
        inputElement.checked = false; // TODO: refactor this and above into common method
        timerElement.innerHTML = "";
        return;
      }

      var timerString = " - ";
      if (days > 0) {
        timerString += days + "d ";
      }
      if (days > 0 || hours > 0) {
        timerString += hours + "h ";
      }
      if (days <= 0) {
        timerString += minutes + "m ";
      }
      if (days <= 0 && hours <= 0 && minutes <= 5) {
        timerString += seconds + "s ";
      }

      timerElement.innerHTML = timerString;
      timerElement.style.color = calculateTimerColor(remainingTimeInMs);

      document.querySelector(".last-refresh .time").innerText = new Date();
    });
  }
  
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
  }

  function calculateTimerColor(remainingTime) {
    const TWENTY_MINUTES_IN_MILLISECONDS = 1200000;
    const ONE_HOUR_IN_MILLISECONDS = 3 * TWENTY_MINUTES_IN_MILLISECONDS;
    const SIX_HOURS_IN_MILLISECONDS = 6 * ONE_HOUR_IN_MILLISECONDS;
    if (remainingTime > SIX_HOURS_IN_MILLISECONDS) {
      return "#f13f3fe0";
    }
    if (remainingTime > ONE_HOUR_IN_MILLISECONDS) {
      return "darkgoldenrod";
    }
    if (remainingTime > TWENTY_MINUTES_IN_MILLISECONDS) {
      return "#ffa500cc";
    }

    return "#00b500";
  }
  
  function getGenshinStatsData() {
    AWS.config.region = 'us-west-2'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-west-2:ab630043-e65c-4951-80a5-54e0ed712457',
    });

    // Prepare to call Lambda function.
    var lambda = new AWS.Lambda({region: 'us-west-2', apiVersion: '2015-03-31'});
    var pullParams = {
      FunctionName : 'GenshinResin',
      InvocationType : 'RequestResponse',
      LogType : 'None',
      Payload: JSON.stringify({"ltuid": localStorage.getItem("ltuid"), "ltoken": localStorage.getItem("ltoken"), "uid": localStorage.getItem("uid")})
    };

    lambda.invoke(pullParams, function(err, data) {
      if (err) {
        prompt(err);
      } else {
        updateResinFromGenshinStatsData(JSON.parse(data.Payload));
      }
    });
  }
  
  function updateResinFromGenshinStatsData(payload) {
    const data = JSON.parse(payload.body);
    console.log(data);
    
    const resinRecoverySeconds = data.resin_recovery_time;
    const nowDate = new Date();
    const resinCapDate = new Date(nowDate.getTime() + resinRecoverySeconds * 1000);
    localStorage.setItem("Resin (Bosses/Domains/Ley Lines)", resinCapDate.getTime());
    
    const maxExpeditionTimeRemaining = data.max_expedition_time_remaining;
    const expeditionCompletionDate = new Date(nowDate.getTime() + maxExpeditionTimeRemaining * 1000);
    localStorage.setItem("Expeditions", expeditionCompletionDate.getTime());
    
    const commissionsCompletedCount = data.completed_commissions;
    if (commissionsCompletedCount !== 0) {
      localStorage.setItem("commissionsCount", commissionsCompletedCount);
    }
    
    if (commissionsCompletedCount == 4) {
      var commissionsResetDate = new Date();
      commissionsResetDate.setHours(1);
      commissionsResetDate.setMinutes(0);
      commissionsResetDate.setSeconds(0);

      if (commissionsResetDate - nowDate < 0) {
        commissionsResetDate.setDate(commissionsResetDate.getDate() + 1);
      }
      
      localStorage.setItem("Commissions", commissionsResetDate.getTime());
    }

    const spiralAbyssMaxFloor = data.spiral_abyss_max_floor;
    if (spiralAbyssMaxFloor === "12-3") {
      const spiralAbyssSeasonEndDate = new Date(data.spiral_abyss_season_end_date);
      localStorage.setItem("Spiral Abyss", spiralAbyssSeasonEndDate.getTime() + 9 * 60 * 60 * 1000);
    }
    
    updatePage();
  }

  const resinDecreaseModButton = document.querySelector("button.resin-decrease-mod");
  resinDecreaseModButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='resin']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    const resinResetUnix = localStorage.getItem(taskName);
    let currentResinInput = document.querySelector(".current-resin");
    if (resinResetUnix === null) {
      currentResinInput.value = 0;
      setResinTimer(taskName, taskNameSpanElement);
      updatePage();
      return;
    }
    const condensedResinCount = Math.floor(parseInt(currentResinInput.value)/40);
    const resinResetDate = new Date(parseInt(resinResetUnix));
    const nowDate = new Date();
    if (resinResetDate.getTime() - nowDate.getTime() < 0) {
      resinResetDate.setMinutes(nowDate.getMinutes());
      currentResinInput.value = 0;
      setResinTimer(taskName, taskNameSpanElement);
    }
    resinResetDate.setMinutes(resinResetDate.getMinutes() + 20*8*2*condensedResinCount);

    if (resinResetDate.getTime() - nowDate.getTime() < 0) {
      resinResetDate.setMinutes(nowDate.getMinutes());
      currentResinInput.value = 0;
      setResinTimer(taskName, taskNameSpanElement);
    } else {
      localStorage.setItem(taskName, resinResetDate.getTime());
    }
    updatePage();
  });
  
  const resinDecreaseButton = document.querySelector("button.resin-decrease");
  resinDecreaseButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='resin']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    const resinResetUnix = localStorage.getItem(taskName);
    let currentResinInput = document.querySelector(".current-resin");
    if (resinResetUnix === null || parseInt(currentResinInput.value) < 20) {
      currentResinInput.value = 0;
      setResinTimer(taskName, taskNameSpanElement);
      updatePage();
      return;
    }
    const resinResetDate = new Date(parseInt(resinResetUnix));
    const nowDate = new Date();
    if (resinResetDate.getTime() - nowDate.getTime() < 0) {
      resinResetDate.setMinutes(nowDate.getMinutes());
      currentResinInput.value = 0;
      setResinTimer(taskName, taskNameSpanElement);
    }
    resinResetDate.setMinutes(resinResetDate.getMinutes() + 160);

    if (resinResetDate.getTime() - nowDate.getTime() < 0) {
      currentResinInput.value = 140;
      setResinTimer(taskName, taskNameSpanElement);
    } else {
      localStorage.setItem(taskName, resinResetDate.getTime());
    }
    updatePage();
  });
  
  const resinDecreaseThirtyButton = document.querySelector("button.resin-decrease-thirty");
  resinDecreaseThirtyButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='resin']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    const resinResetUnix = localStorage.getItem(taskName);
    let currentResinInput = document.querySelector(".current-resin");
    if (resinResetUnix === null || parseInt(currentResinInput.value) < 20) {
      currentResinInput.value = 0;
      setResinTimer(taskName, taskNameSpanElement);
      updatePage();
      return;
    }
    const resinResetDate = new Date(parseInt(resinResetUnix));

    const nowDate = new Date();
    if (resinResetDate.getTime() - nowDate.getTime() < 0) {
      resinResetDate.setMinutes(nowDate.getMinutes());
      currentResinInput.value = 160;
      setResinTimer(taskName, taskNameSpanElement);
    }
    resinResetDate.setMinutes(resinResetDate.getMinutes() + 240);

    if (resinResetDate.getTime() - nowDate.getTime() < 0) {
      currentResinInput.value = 130;
      setResinTimer(taskName, taskNameSpanElement);
    } else {
      localStorage.setItem(taskName, resinResetDate.getTime());
    }
    updatePage();
  });
  
  const resinIncreaseButton = document.querySelector("button.resin-increase");
  resinIncreaseButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='resin']"
    );
    const taskName = taskNameSpanElement.innerText;
    const resinResetUnix = localStorage.getItem(taskName);
    let currentResinInput = document.querySelector(".current-resin");
    if (resinResetUnix === null || parseInt(currentResinInput.value) > 140) {
      currentResinInput.value = 160;
      setResinTimer(taskName, taskNameSpanElement);
      updatePage();
      return;
    }
    const resinResetDate = new Date(parseInt(resinResetUnix));
    resinResetDate.setMinutes(resinResetDate.getMinutes() - 160);

    localStorage.setItem(taskName, resinResetDate.getTime());
    updatePage();
  });

  const commissionDecreaseButton = document.querySelector("button.commission-decrease");
  commissionDecreaseButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='commission']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    let commissionsResetUnix = localStorage.getItem(taskName);
    let commissionsCount = localStorage.getItem("commissionsCount");
    
    var now = new Date().getTime();
    
    let completedCommissionsInput = document.querySelector(".completed-commissions");
    
    // if no reset time, then set commissions to 0
    if (commissionsResetUnix === null || commissionsResetUnix - now <= 0) {
        commissionsCount = 0;
        localStorage.setItem(taskName, null);
        localStorage.setItem("commissionsCount", 0);
    } else {
        commissionsCount = parseInt(commissionsCount);
        commissionsCount = Math.max(0, commissionsCount - 1);
        localStorage.setItem(taskName, null);
        localStorage.setItem("commissionsCount", commissionsCount);
    }
    
    completedCommissionsInput.value = commissionsCount;

    updatePage();
  });

  const commissionIncreaseButton = document.querySelector("button.commission-increase");
  commissionIncreaseButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='commission']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    let commissionsResetUnix = localStorage.getItem(taskName);
    let commissionsCount = localStorage.getItem("commissionsCount");
    
    var now = new Date().getTime();
    
    let completedCommissionsInput = document.querySelector(".completed-commissions");
    
    // if no reset time, then set commissions to 0
    if (commissionsResetUnix === null || commissionsResetUnix - now <= 0) {
        commissionsCount = 1;
        localStorage.setItem(taskName, null);
        localStorage.setItem("commissionsCount", 1);
    } else {
        commissionsCount = parseInt(commissionsCount);
        commissionsCount = Math.min(4, commissionsCount + 1)
        localStorage.setItem(taskName, null);
        localStorage.setItem("commissionsCount", commissionsCount);
    }
    
    completedCommissionsInput.value = commissionsCount;
    
    if (commissionsCount === 4) {
      setDailyTimer(taskName, taskNameSpanElement);
    } else {
      localStorage.setItem(taskName, null);
    }

    updatePage();
  });

  const bountyDecreaseButton = document.querySelector("button.bounty-decrease");
  bountyDecreaseButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='bounty']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    let bountiesResetUnix = localStorage.getItem(taskName);
    let bountiesCount = localStorage.getItem("bountiesCount");
    
    var now = new Date().getTime();
    
    let completedBountiesInput = document.querySelector(".completed-bounties");
    
    // if no reset time, then set bounties to 0
    if (bountiesResetUnix === null || bountiesResetUnix - now <= 0) {
        bountiesCount = 0;
        localStorage.setItem(taskName, null);
        localStorage.setItem("bountiesCount", 0);
    } else {
        bountiesCount = parseInt(bountiesCount);
        bountiesCount = Math.max(0, bountiesCount - 1);
        localStorage.setItem(taskName, null);
        localStorage.setItem("bountiesCount", bountiesCount);
    }
    
    completedBountiesInput.value = bountiesCount;

    updatePage();
  });

  const bountyIncreaseButton = document.querySelector("button.bounty-increase");
  bountyIncreaseButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='bounty']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    let bountiesResetUnix = localStorage.getItem(taskName);
    let bountiesCount = localStorage.getItem("bountiesCount");
    
    var now = new Date().getTime();
    
    let completedBountiesInput = document.querySelector(".completed-bounties");
    
    // if no reset time, then set bounties to 0
    if (bountiesResetUnix === null || bountiesResetUnix - now <= 0) {
        bountiesCount = 1;
        localStorage.setItem(taskName, null);
        localStorage.setItem("bountiesCount", 1);
    } else {
        bountiesCount = parseInt(bountiesCount);
        bountiesCount = Math.min(3, bountiesCount + 1)
        localStorage.setItem(taskName, null);
        localStorage.setItem("bountiesCount", bountiesCount);
    }
    
    completedBountiesInput.value = bountiesCount;
    
    if (bountiesCount === 3) {
      setWeeklyTimer(taskName, taskNameSpanElement);
    } else {
      localStorage.setItem(taskName, null);
    }

    updatePage();
  });

  const requestDecreaseButton = document.querySelector("button.request-decrease");
  requestDecreaseButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='request']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    let requestsResetUnix = localStorage.getItem(taskName);
    let requestsCount = localStorage.getItem("requestsCount");
    
    var now = new Date().getTime();
    
    let completedRequestsInput = document.querySelector(".completed-requests");
    
    // if no reset time, then set commissions to 0
    if (requestsResetUnix === null || requestsResetUnix - now <= 0) {
        requestsCount = 0;
        localStorage.setItem(taskName, null);
        localStorage.setItem("requestsCount", 0);
    } else {
        requestsCount = parseInt(requestsCount);
        requestsCount = Math.max(0, requestsCount - 1);
        localStorage.setItem(taskName, null);
        localStorage.setItem("requestsCount", requestsCount);
    }
    
    completedRequestsInput.value = requestsCount;

    updatePage();
  });

  const requestIncreaseButton = document.querySelector("button.request-increase");
  requestIncreaseButton.addEventListener("click", (event) => {
    const taskNameSpanElement = document.querySelector(
      ".task-name[timer-type='request']"
    );
    
    const taskName = taskNameSpanElement.innerText;
    let requestsResetUnix = localStorage.getItem(taskName);
    let requestsCount = localStorage.getItem("requestsCount");
    
    var now = new Date().getTime();
    
    let completedRequestsInput = document.querySelector(".completed-requests");
    
    // if no reset time, then set requests to 0
    if (requestsResetUnix === null || requestsResetUnix - now <= 0) {
        requestsCount = 1;
        localStorage.setItem(taskName, null);
        localStorage.setItem("requestsCount", 1);
    } else {
        requestsCount = parseInt(requestsCount);
        requestsCount = Math.min(3, requestsCount + 1)
        localStorage.setItem(taskName, null);
        localStorage.setItem("requestsCount", requestsCount);
    }
    
    completedRequestsInput.value = requestsCount;
    
    if (requestsCount === 3) {
      setWeeklyTimer(taskName, taskNameSpanElement);
    } else {
      localStorage.setItem(taskName, null);
    }

    updatePage();
  });
  
  const tabElements = document.querySelectorAll(".tab");
  tabElements.forEach(function (element) {
    element.addEventListener("click", (event) => {
      // Declare all variables
      let i, tabcontent, tablinks;

      // Get all elements with class="tab-content" and hide them
      tabContent = document.querySelectorAll(".tab-content");
      for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
      }

      // Get all elements with class="tab" and remove the class "active"
      tab = document.querySelectorAll(".tab");
      for (i = 0; i < tab.length; i++) {
        tab[i].className = tab[i].className.replace(" active", "");
      }

      // Add an "active" class to the button that opened the tab
      element.className += " active";
      // Show the relevant tab
      document.querySelector(".tab-content[content='" + element.innerText + "']").style.display = "block";
    });
  });
  
  const tabActivateButtons = document.querySelectorAll("button.activate-tab");
  tabActivateButtons.forEach(function (element) {
    element.addEventListener("click", (event) => {
      // Declare all variables
      let i, tabcontent, tablinks;

      // Get all elements with class="tab-content" and hide them
      tabContent = document.querySelectorAll(".tab-content");
      for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
      }

      // Get all elements with class="tab" and remove the class "active"
      tab = document.querySelectorAll(".tab");
      for (i = 0; i < tab.length; i++) {
        tab[i].className = tab[i].className.replace(" active", "");
      }

      // Add an "active" class to the button that opened the tab
      var tabToActivate;
      document.querySelectorAll(".tab").forEach(function (tab) {
        var tabName = element.getAttribute("tab-name");
        if (tabName === tab.innerText) {
          tab.className += " active";
          // Show the relevant tab
          document.querySelector(".tab-content[content='" + tab.innerText + "']").style.display = "block";
          // break;
        }
      });
    });
  });
  
  $('.remaining-resin-refill-time').keyup(function(){
    let removedColons = $(this).val().replaceAll(":","");
    $(this).val(removedColons.replace(/(\d{1,2})\-?(\d{2})\-?(\d{2})/,'$1:$2:$3'));
  });

  updatePage();
  

  
  // TODO: update checkbox status if timer exists
  // TODO: Remove timer when unchecking
  // TODO: round edges of hover
})(window.jQuery);