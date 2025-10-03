// Change as needed if the leave amounts change

const FULL_TIME_HOURS = 35;
const PART_TIME_HOURS = 18;

const LEAVE_ALLOTMENTS = [
  // 0-14 years of service
  {
    yearsOfService: '0-14',
    // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 140,
    partTimeAnnualLeave: (140 / FULL_TIME_HOURS) * PART_TIME_HOURS,
  },
  // 15-29 years of service
  {
    yearsOfService: '15-29',
    // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 175,
    partTimeAnnualLeave: (175 / FULL_TIME_HOURS) * PART_TIME_HOURS,
  },
  // 30+ years of service
  {
    yearsOfService: '30+',
    // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 210,
    partTimeAnnualLeave: (210 / FULL_TIME_HOURS) * PART_TIME_HOURS,
  },
]


// Don't change anything below this line
class LeaveCalculator extends HTMLElement {
  constructor() {
    super();
    this.yearsOfService = LEAVE_ALLOTMENTS[0].yearsOfService;
    this.hoursPerWeek = FULL_TIME_HOURS;
    this.unusedHours = 0;
  }

  createYearsOfService() {
      const yearsOfService = document.createElement("div");
      yearsOfService.setAttribute('class', 'calculator__row');
      const yearsOfServiceLabel = document.createElement('label');
      yearsOfServiceLabel.innerText = "How many years of service will you have completed on December 31?"
      yearsOfServiceLabel.setAttribute("for", "yearsOfService");
      yearsOfServiceLabel.setAttribute("class", "calculator__label");
      yearsOfService.appendChild(yearsOfServiceLabel);
      const yearsOfServiceInput = document.createElement("select");
      yearsOfServiceInput.required = true;
      yearsOfServiceInput.setAttribute('id', "yearsOfService");
      LEAVE_ALLOTMENTS.forEach(group => {
          const yearsOfServiceOption = document.createElement("option");
          yearsOfServiceOption.innerText = group.yearsOfService;
          yearsOfServiceOption.setAttribute("value", group.yearsOfService);
          yearsOfServiceInput.appendChild(yearsOfServiceOption);
      });
      yearsOfServiceInput.addEventListener('change', (event) => {
          this.yearsOfService = event.target.value;
          this.clearResults();
      });
      yearsOfService.appendChild(yearsOfServiceInput);
      return yearsOfService;
  }

  createHoursPerWeek() {
      const handleChange = (event) => {
          this.clearResults();
          if (event.target.checked) {
              this.hoursPerWeek = parseInt(event.target.value, 10);
          }
      };
      const hoursPerWeek = document.createElement("div");
      hoursPerWeek.setAttribute('class', 'calculator__row');
      hoursPerWeek.setAttribute("role", "radiogroup");
      hoursPerWeek.setAttribute('aria-labelledby', "hoursPerWeek");
      const hoursPerWeekLabel = document.createElement("div");
      hoursPerWeekLabel.innerText = "How many weekly Standard Hours are listed on your time sheet?"
      hoursPerWeekLabel.setAttribute("id", "hoursPerWeek");
      hoursPerWeekLabel.setAttribute("class", "calculator__label");
      hoursPerWeek.appendChild(hoursPerWeekLabel);
      const hoursPerWeekFullInput = document.createElement("input");
      hoursPerWeekFullInput.setAttribute("type", "radio");
      hoursPerWeekFullInput.setAttribute("value", String(FULL_TIME_HOURS));
      hoursPerWeekFullInput.setAttribute("name", "hoursPerWeek");
      hoursPerWeekFullInput.setAttribute("id", "hoursPerWeekFullTime");
      hoursPerWeekFullInput.checked = true;
      hoursPerWeekFullInput.addEventListener("change", handleChange);
      hoursPerWeek.appendChild(hoursPerWeekFullInput);
      const hoursPerWeekFullLabel = document.createElement("label");
      hoursPerWeekFullLabel.setAttribute("for", "hoursPerWeekFullTime");
      hoursPerWeekFullLabel.innerText = `${FULL_TIME_HOURS} hours`;
      hoursPerWeek.appendChild(hoursPerWeekFullLabel);
      const hoursPerWeekPartInput = document.createElement("input");
      hoursPerWeekPartInput.setAttribute("type", "radio");
      hoursPerWeekPartInput.setAttribute("value", String(PART_TIME_HOURS));
      hoursPerWeekPartInput.setAttribute("name", "hoursPerWeek");
      hoursPerWeekPartInput.setAttribute("id", "hoursPerWeekPartTime");
      hoursPerWeekPartInput.addEventListener("change", handleChange);
      hoursPerWeek.appendChild(hoursPerWeekPartInput);
      const hoursPerWeekPartLabel = document.createElement("label");
      hoursPerWeekPartLabel.setAttribute("for", "hoursPerWeekPartTime");
      hoursPerWeekPartLabel.innerText = `${PART_TIME_HOURS} hours`;
      hoursPerWeek.appendChild(hoursPerWeekPartLabel);
      return hoursPerWeek;
  }

  createUnusedHours() {
      const unusedHours = document.createElement("div");
      unusedHours.setAttribute('class', 'calculator__row');
      const unusedHoursLabel = document.createElement("label");
      unusedHoursLabel.innerText = "How many of your vacation hours will remain unused by December 31?"
      unusedHoursLabel.setAttribute("for", "unusedHours");
      unusedHours.appendChild(unusedHoursLabel);
      const unusedHoursInput = document.createElement("input");
      unusedHoursInput.id = "unusedHours";
      unusedHoursInput.setAttribute("name", "unusedHours");
      unusedHoursInput.setAttribute("type", "number");
      unusedHoursInput.addEventListener("change", (event) => {
          this.unusedHours = parseFloat(event.target.value);
          this.clearResults();
      });
      unusedHours.appendChild(unusedHoursInput);
      return unusedHours;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    wrapper.setAttribute('class', 'calculator');
    const yearsOfServiceElement = this.createYearsOfService();
    const hoursPerWeekElement = this.createHoursPerWeek();
    const unusedHoursElement = this.createUnusedHours();
    const submitButton = document.createElement("button");
    submitButton.setAttribute("type", "submit");
    submitButton.innerText = "Calculate!";
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.displayResults();
    })

    this.resultsArea = document.createElement("div");

    wrapper.appendChild(yearsOfServiceElement);
    wrapper.appendChild(hoursPerWeekElement);
    wrapper.appendChild(unusedHoursElement);
    wrapper.appendChild(submitButton);
    wrapper.appendChild(this.resultsArea);
    shadow.appendChild(wrapper);
  }

  clearResults() {
      this.resultsArea.classList.remove('calculator__no-action', 'calculator__action');
      this.resultsArea.innerHTML = '';
  }

  displayResults() {
      this.clearResults();
      const {
          totalAnnualLeave,
          leaveAwardedJan1,
          jan1Balance,
          carryOver,
          maximumCarryover
      } = this.calculateCarryover();
      if (carryOver <= 0) {
          this.resultsArea.classList.add('calculator__no-action');
          this.resultsArea.innerHTML = `
<h2>No Action Required</h2>
<p>Your projected balance on January 1 is less or equal to your contractual carryover limit. You do not need to request any additional carryover.</p>
`;
      } else {
          this.resultsArea.classList.add('calculator__action');
          this.resultsArea.innerHTML = `
<h2>Action Required</h2>
<p>The total of your projected balance on December 31 plus your January 1 award amount is more than your contractual carryover limit. Your estimated carryover request amount is <strong>${carryOver} hours</strong>.</p>
`;
      }
      const resultsTable = document.createElement("table");
      const resultsCaption = document.createElement("caption");
      resultsCaption.innerText = "Your Leave";
      resultsTable.insertAdjacentHTML('beforeend', `
<tr>
    <td></td>
    <th scope="col">Hours</th>
    <th scope="col">Weeks</th>
</tr>
<tr>
    <th scope="row">Total Annual Leave</th>
    <td>${totalAnnualLeave}</td>
    <td>${totalAnnualLeave / this.hoursPerWeek}</td>
</tr>
<tr>
    <th scope="row">Amount of Annual Leave Awarded Jan 1</th>
    <td>${leaveAwardedJan1}</td>
    <td>${leaveAwardedJan1 / this.hoursPerWeek}</td>
</tr>
<tr>
    <th scope="row">Estimated Balance on Jan 1</th>
    <td>${jan1Balance}</td>
    <td>${jan1Balance / this.hoursPerWeek}</td>
</tr> 
<tr>
    <th scope="row">Maximum Carryover Limit</th>
    <td>${maximumCarryover}</td>
    <td>${maximumCarryover / this.hoursPerWeek}</td>
</tr>     
`);

      this.resultsArea.appendChild(resultsTable);
  }

  calculateCarryover() {
      const leaveAllotment = LEAVE_ALLOTMENTS.find(group => group.yearsOfService === this.yearsOfService);
      if (!leaveAllotment) {
          this.resultsArea.innerText = "Something has gone wrong! Did you fill out all of the fields?";
      }
      const totalAnnualLeave =
          this.hoursPerWeek === FULL_TIME_HOURS
              ? leaveAllotment.fullTimeAnnualLeave
              : leaveAllotment.partTimeAnnualLeave;
      const leaveAwardedJan1 = totalAnnualLeave / 2;
      const maximumCarryover = totalAnnualLeave + this.hoursPerWeek;
      const jan1Balance = this.unusedHours + leaveAwardedJan1;
      return {
          totalAnnualLeave,
          leaveAwardedJan1,
          maximumCarryover,
          jan1Balance,
          carryOver: jan1Balance - maximumCarryover
      };
  }
}

customElements.define("leave-calculator", LeaveCalculator)