// Change as needed if the leave amounts change

const FULL_TIME_HOURS = 35;
const PART_TIME_HOURS = 18;

const LEAVE_ALLOTMENTS = [// 0-14 years of service
  {
    yearsOfService: '0-14', // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 140, partTimeAnnualLeave: (140 / FULL_TIME_HOURS) * PART_TIME_HOURS,
  }, // 15-29 years of service
  {
    yearsOfService: '15-29', // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 175, partTimeAnnualLeave: (175 / FULL_TIME_HOURS) * PART_TIME_HOURS,
  }, // 30+ years of service
  {
    yearsOfService: '30+', // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 210, partTimeAnnualLeave: (210 / FULL_TIME_HOURS) * PART_TIME_HOURS,
  },]

// Change as needed for estimated retirement payout
const NUMBER_OF_SALARIES_USED = 3;
// Fraction of sick leave hours that are paid out
const SICK_LEAVE_PAYOUT = 0.25;

// Don't change anything below this line unless you know what you are doing.
class CalculatorBase extends HTMLElement {
  constructor() {
    super();
  }

  createStylesheet() {
    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(`
.calculator {
  accent-color: var(--toggle-on-color);
  background-color: var(--siteBackgroundColor);
  color: var(--paragraphMediumColor);
  font-family: var(--body-font-font-family);
  padding: 3vw;
}
.calculator strong {
  font-family: var(--heading-font-font-family);
  font-size: var(--normal-text-size);
  font-weight: var(--heading-font-font-weight);
}
.calculator__heading {
  color: var(--headingMediumColor);
  font-family: var(--heading-font-font-family);
  font-size: var(--heading-4-size);
  font-weight: var(--heading-font-font-weight);
  margin-block: 0 1rem;
}
.calculator__inner {
  display: grid;
  grid-template-columns: 100%;
  gap: 2rem;
}
.calculator__row {
  margin-block-end: 1rem;
}
.calculator__label {
  display: block;
  margin-block-end: 0.25rem;
}
.calculator__select {
  font-family: inherit;
  font-size: inherit;
}
.calculator__input {
  font-family: inherit;
  font-size: inherit;
  padding-inline: 0.25rem;
}
.calculator__input:not([size]) {
  inline-size: 5em;
}
.calculator__action,
.calculator__no-action {
  border: 1px solid currentColor;
  margin-block-start: 2rem;
  padding: 1rem;
}
.calculator__no-action {
  background-color: hsla(var(--lightAccent-hsl),1);
}
.calculator__action {
  background-color: hsla(var(--safeDarkAccent-hsl),1);
}
.calculator__table {
  border-collapse: collapse;
  color: inherit;
}
.calculator__table th {
  font-family: var(--heading-font-font-family);
  font-size: var(--normal-text-size);
  font-weight: var(--heading-font-font-weight);
  padding-block: 0.25rem;
  padding-inline: 0.5rem;
}
.calculator__table th[scope="row"] {
  border-block-end: 1px solid currentColor;
  text-align: end;
}
.calculator__table td {
  padding-block: 0.25rem;
  padding-inline: 0.5rem;
}
.calculator__table td:not(:empty) {
  border-block-end: 1px solid currentColor;
}
.calculator__button {
  background-color: var(--primaryButtonBackgroundColor);
  border-radius: 0.25rem;
  border: 2px solid currentColor;
  color: var(--primaryButtonTextColor);
  font-family: var(--heading-font-font-family);
  font-size: var(--large-text-size);
  font-weight: var(--heading-font-font-weight);
  padding-block: 0.5rem;
  padding-inline: 1rem;
}
.calculator__fieldset {
  display: grid;
  border: 0;
  grid-template-columns: max-content max-content;
  margin-inline: 0;
  padding-inline: 0;
}
.calculator__legend {
  font-family: var(--heading-font-font-family);
  font-size: var(--large-text-size);
  font-weight: var(--heading-font-font-weight);
}
.calculator__fieldset .calculator__row {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: subgrid;
  grid-column: 1 / span 2;
}
@media (width >= 1024px) {
  .calculator__inner {
    column-gap: 4rem;
    grid-template-columns: max-content 1fr;
  }
  
  .calculator__row {
    align-items: center;
    display: flex;
    gap: 0.5rem;
  }
}     
`);
    return stylesheet;
  }

  createHeading(headingText) {
    const heading = document.createElement('h3');
    heading.innerText = headingText;
    heading.classList.add('calculator__heading');
    this.wrapper.appendChild(heading);
  }

  clearResults() {
    this.resultsArea.classList.remove('calculator__no-action', 'calculator__action');
    this.resultsArea.innerHTML = '';
  }

  createSubmitButton() {
    const submitButton = document.createElement("button");
    submitButton.setAttribute("class", "calculator__button");
    submitButton.setAttribute("type", "submit");
    submitButton.innerText = "Calculate!";
    submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.displayResults();
    })
    return submitButton;
  }

  connectedCallback() {
    const stylesheet = this.createStylesheet();
    this.shadow = this.attachShadow({mode: "open"});
    this.shadow.adoptedStyleSheets = [stylesheet];
    this.wrapper = document.createElement("div");
    this.wrapper.setAttribute('class', 'calculator');
    this.resultsArea = document.createElement("div");
  }
}

class LeaveCalculator extends CalculatorBase {
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
    yearsOfServiceInput.setAttribute("class", "calculator__select");
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
    unusedHoursLabel.setAttribute("class", "calculator__label");
    unusedHours.appendChild(unusedHoursLabel);
    const unusedHoursInput = document.createElement("input");
    unusedHoursInput.id = "unusedHours";
    unusedHoursInput.setAttribute("name", "unusedHours");
    unusedHoursInput.setAttribute("type", "number");
    unusedHoursInput.setAttribute("class", "calculator__input");
    unusedHoursInput.addEventListener("keyup", (event) => {
      this.unusedHours = parseFloat(event.target.value);
      this.clearResults();
    });
    unusedHoursInput.addEventListener("change", (event) => {
      this.unusedHours = parseFloat(event.target.value);
      this.clearResults();
    });
    unusedHours.appendChild(unusedHoursInput);
    return unusedHours;
  }

  connectedCallback() {
    super.connectedCallback();
    this.createHeading("Leave Carryover Calculator");
    const yearsOfServiceElement = this.createYearsOfService();
    const hoursPerWeekElement = this.createHoursPerWeek();
    const unusedHoursElement = this.createUnusedHours();
    const submitButton = this.createSubmitButton();
    this.wrapper.appendChild(yearsOfServiceElement);
    this.wrapper.appendChild(hoursPerWeekElement);
    this.wrapper.appendChild(unusedHoursElement);
    this.wrapper.appendChild(submitButton);
    this.wrapper.appendChild(this.resultsArea);
    this.shadow.appendChild(this.wrapper);
  }

  displayResults() {
    this.clearResults();
    const {
      totalAnnualLeave, leaveAwardedJan1, jan1Balance, carryOver, maximumCarryover
    } = this.calculateCarryover();
    if (carryOver <= 0) {
      this.resultsArea.classList.add('calculator__no-action');
      this.resultsArea.innerHTML = `
<h4 class="calculator__heading">No Action Required</h4>
<p>Your projected balance on January 1 is less or equal to your contractual carryover limit. You do not need to request any additional carryover.</p>
`;
    } else {
      this.resultsArea.classList.add('calculator__action');
      this.resultsArea.innerHTML = `
<h4 class="calculator__heading">Action Required</h4>
<p>The total of your projected balance on December 31 plus your January 1 award amount is more than your contractual carryover limit. Your estimated carryover request amount is <strong>${carryOver} hours</strong>.</p>
`;
    }
    const resultsTable = document.createElement("table");
    resultsTable.setAttribute("class", "calculator__table");
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
    <td>${Math.round(jan1Balance / this.hoursPerWeek * 10) / 10}</td>
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
    const totalAnnualLeave = this.hoursPerWeek === FULL_TIME_HOURS ? leaveAllotment.fullTimeAnnualLeave : leaveAllotment.partTimeAnnualLeave;
    const leaveAwardedJan1 = totalAnnualLeave / 2;
    const maximumCarryover = totalAnnualLeave + this.hoursPerWeek;
    const jan1Balance = this.unusedHours + leaveAwardedJan1;
    return {
      totalAnnualLeave, leaveAwardedJan1, maximumCarryover, jan1Balance, carryOver: jan1Balance - maximumCarryover
    };
  }
}

class PayoutCalculator extends CalculatorBase {
  constructor() {
    super();
    this.salaries = [];
    this.unusedVacation = 0;
    this.unusedSickLeave = 0;
    this.unusedCompensatory = 0;
  }

  createSalaryInput(index) {
    const salaryInput = document.createElement("div");
    salaryInput.classList.add("calculator__row");
    const salaryLabel = document.createElement("label");
    salaryLabel.classList.add("calculator__label");
    salaryLabel.innerText = `Salary ${index + 1}`;
    salaryLabel.setAttribute('for', `salary-${index}`);
    salaryInput.append(salaryLabel);
    const salaryInputInput = document.createElement("input");
    salaryInputInput.classList.add("calculator__input");
    salaryInputInput.setAttribute("id", `salary-${index}`);
    salaryInputInput.type = "number";
    salaryInputInput.step = "1000";
    salaryInputInput.min = "0";
    salaryInputInput.size = 10;
    salaryInputInput.addEventListener('keyup', (e) => {
      this.salaries[index] = e.target.value;
      this.clearResults();
    });
    salaryInputInput.addEventListener('change', (e) => {
      this.salaries[index] = e.target.value;
      this.clearResults();
    });
    salaryInput.append(salaryInputInput);
    return salaryInput;
  }

  createSalaries() {
    const salaries = document.createElement("fieldset");
    salaries.classList.add("calculator__fieldset");
    const salariesLegend = document.createElement("legend");
    salariesLegend.classList.add("calculator__legend");
    salariesLegend.innerText = `Enter your ${NUMBER_OF_SALARIES_USED} highest salaries`;
    for (let i = 0; i < NUMBER_OF_SALARIES_USED; i++) {
      const salaryInput = this.createSalaryInput(i);
      salaries.append(salaryInput);
    }
    salaries.appendChild(salariesLegend);
    return salaries;
  }

  createLeavePayout() {
    const leavePayout = document.createElement("fieldset");
    leavePayout.classList.add("calculator__fieldset");
    const leavePayoutLegend = document.createElement("legend");
    leavePayoutLegend.classList.add("calculator__legend");
    leavePayoutLegend.innerText = "Your Leave";
    leavePayout.appendChild(leavePayoutLegend);
    leavePayout.appendChild(this.createUnusedVacation());
    leavePayout.appendChild(this.createUnusedSickLeave());
    leavePayout.appendChild(this.createUnusedCompensatory());
    return leavePayout;
  }

  createUnusedVacation() {
    const unusedVacation = document.createElement("div");
    unusedVacation.classList.add("calculator__row");
    const unusedVacationLabel = document.createElement("label");
    unusedVacationLabel.classList.add("calculator__label");
    unusedVacationLabel.setAttribute("for", "unusedVacation");
    unusedVacationLabel.innerText = `Unused Vacation Hours`;
    unusedVacation.append(unusedVacationLabel);
    const unusedVacationInput = document.createElement("input");
    unusedVacationInput.classList.add("calculator__input");
    unusedVacationInput.type = "number";
    unusedVacationInput.id = "unusedVacation";
    unusedVacationInput.addEventListener("change", (e) => {
      this.unusedVacation = parseFloat(e.target.value);
      this.clearResults();
    })
    unusedVacation.appendChild(unusedVacationInput);
    return unusedVacation;
  }

  createUnusedSickLeave() {
    const unusedSickLeave = document.createElement("div");
    unusedSickLeave.classList.add("calculator__row");
    const unusedSickLeaveLabel = document.createElement("label");
    unusedSickLeaveLabel.classList.add("calculator__label");
    unusedSickLeaveLabel.setAttribute("for", "unusedSickLeave");
    unusedSickLeaveLabel.innerText = `Unused Sick Leave Hours`;
    unusedSickLeave.append(unusedSickLeaveLabel);
    const unusedSickInput = document.createElement("input");
    unusedSickInput.classList.add("calculator__input");
    unusedSickInput.type = "number";
    unusedSickInput.id = "unusedSickLeave";
    unusedSickInput.addEventListener("change", (e) => {
      this.unusedSickLeave = parseFloat(e.target.value) * SICK_LEAVE_PAYOUT;
      this.clearResults();
    })
    unusedSickLeave.appendChild(unusedSickInput);
    return unusedSickLeave;
  }

  createUnusedCompensatory() {
    const unusedCompensatory = document.createElement("div");
    unusedCompensatory.classList.add("calculator__row");
    const unusedCompensatoryLabel = document.createElement("label");
    unusedCompensatoryLabel.classList.add("calculator__label");
    unusedCompensatoryLabel.setAttribute("for", "unusedCompensatory");
    unusedCompensatoryLabel.innerHTML = `Unused Compensatory Leave <small>(if any)</small>`;
    unusedCompensatory.append(unusedCompensatoryLabel);
    const unusedCompensatoryInput = document.createElement("input");
    unusedCompensatoryInput.classList.add("calculator__input");
    unusedCompensatoryInput.type = "number";
    unusedCompensatoryInput.id = "unusedCompensatory";
    unusedCompensatoryInput.addEventListener("change", (e) => {
      this.unusedCompensatory = parseFloat(e.target.value);
      this.clearResults();
    })
    unusedCompensatory.appendChild(unusedCompensatoryInput);
    return unusedCompensatory;
  }

  displayResults() {
    this.clearResults();
    const numberFormatOptions = {
      currency: "USD",
      currencyDisplay: "symbol",
      style: "currency",
    }
    const {hourlyAverage, totalPayout, vacationPayout, sickLeavePayout, compensatoryPayout} = this.calculatePayout();
    if (hourlyAverage) {
      this.resultsArea.classList.add('calculator__no-action');
      this.resultsArea.innerHTML = `
<h4 class="calculator__heading">Your Estimated Payout</h4>
<p>Your estimated payout at retirement is <strong>${totalPayout.toLocaleString("en-US", numberFormatOptions)}</strong>. Your hourly average is ${hourlyAverage.toLocaleString("en-US", numberFormatOptions)}.</p>
<table class="calculator__table">
  <tr>
    <td></td>
    <th scope="col">Payout amount</th>
  </tr>
  <tr>
    <th scope="row">Vacation</th>
    <td>${vacationPayout.toLocaleString("en-US", numberFormatOptions)}</td>
  </tr>
  <tr>
    <th scope="row">Sick Leave</th>
    <td>${sickLeavePayout.toLocaleString("en-US", numberFormatOptions)}</td>
  </tr>
  <tr>
    <th scope="row">Compensatory Leave</th>
    <td>${compensatoryPayout.toLocaleString("en-US", numberFormatOptions)}</td>
  </tr>
</table>      
`
    } else {
      this.resultsArea.classList.add("calculator__action");
    }
  }

  calculatePayout() {
    if (this.salaries.length < NUMBER_OF_SALARIES_USED) {
      this.resultsArea.innerText = `You must enter your ${NUMBER_OF_SALARIES_USED} highest salaries first.`
      return {};
    } else {
      const totalSalaries = this.salaries.reduce((acc, current) => acc + parseFloat(current), 0);
      const hourlyAverage = (totalSalaries / NUMBER_OF_SALARIES_USED) / (FULL_TIME_HOURS * 52);
      const vacationPayout = hourlyAverage * this.unusedVacation;
      const sickLeavePayout = hourlyAverage * this.unusedSickLeave;
      const compensatoryPayout = hourlyAverage * this.unusedCompensatory;
      const totalPayout = vacationPayout + sickLeavePayout + compensatoryPayout;
      return {hourlyAverage, vacationPayout, sickLeavePayout, compensatoryPayout, totalPayout};
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.createHeading("Estimated Retirement Payout Calculator");
    const disclaimer = document.createElement("p");
    disclaimer.innerText = "This calculator can help you ESTIMATE your retirement pay out. Please speak with a representative from the Retirement Board for your official numbers.";
    const salaries = this.createSalaries();
    const leavePayout = this.createLeavePayout();
    const submitButton = this.createSubmitButton();
    const innerWrapper = document.createElement("div");
    innerWrapper.classList.add("calculator__inner");
    innerWrapper.appendChild(salaries);
    innerWrapper.appendChild(leavePayout);
    this.wrapper.appendChild(disclaimer);
    this.wrapper.appendChild(innerWrapper);
    this.wrapper.appendChild(submitButton);
    this.wrapper.appendChild(this.resultsArea);
    this.shadow.appendChild(this.wrapper);
  }
}

customElements.define("leave-calculator", LeaveCalculator);
customElements.define("payout-calculator", PayoutCalculator);