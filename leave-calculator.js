// Change as needed if the leave amounts change

const FULL_TIME_HOURS = 35;
const PART_TIME_HOURS = 18;

const LEAVE_ALLOTMENTS = [
  // 0-14 years of service
  {
    yearsOfService: '0-14',
    // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 140,
    partTimeAnnualLeave: (this.fullTimeAnnualLeave / FULL_TIME_HOURS) * PART_TIME_HOURS,
  },
  // 15-29 years of service
  {
    yearsOfService: '15-29',
    // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 175,
    partTimeAnnualLeave: (this.fullTimeAnnualLeave / FULL_TIME_HOURS) * PART_TIME_HOURS,
  },
  // 30+ years of service
  {
    yearsOfService: '30+',
    // Hours of leave earned for full-time employees
    fullTimeAnnualLeave: 210,
    partTimeAnnualLeave: (this.fullTimeAnnualLeave / FULL_TIME_HOURS) * PART_TIME_HOURS,
  },
]


// Don't change anything below this line
class LeaveCalculator extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    wrapper.setAttribute('class', 'calculator');

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
    yearsOfService.appendChild(yearsOfServiceInput);

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
    hoursPerWeekFullInput.setAttribute("value", "fullTime");
    hoursPerWeekFullInput.setAttribute("name", "hoursPerWeek");
    hoursPerWeekFullInput.setAttribute("id", "hoursPerWeekFullTime");
    hoursPerWeekFullInput.checked = true;
    hoursPerWeek.appendChild(hoursPerWeekFullInput);
    const hoursPerWeekFullLabel = document.createElement("label");
    hoursPerWeekFullLabel.setAttribute("for", "hoursPerWeekFullTime");
    hoursPerWeekFullLabel.innerText = `${FULL_TIME_HOURS} hours`;
    hoursPerWeek.appendChild(hoursPerWeekFullLabel);
    const hoursPerWeekPartInput = document.createElement("input");
    hoursPerWeekPartInput.setAttribute("type", "radio");
    hoursPerWeekPartInput.setAttribute("value", "partTime");
    hoursPerWeekPartInput.setAttribute("name", "hoursPerWeek");
    hoursPerWeekPartInput.setAttribute("id", "hoursPerWeekPartTime");
    hoursPerWeek.appendChild(hoursPerWeekPartInput);
    const hoursPerWeekPartLabel = document.createElement("label");
    hoursPerWeekPartLabel.setAttribute("for", "hoursPerWeekPartTime");
    hoursPerWeekPartLabel.innerText = `${PART_TIME_HOURS} hours`;
    hoursPerWeek.appendChild(hoursPerWeekPartLabel);

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
    unusedHours.appendChild(unusedHoursInput);

    const submitButton = document.createElement("button");
    submitButton.setAttribute("type", "submit");
    submitButton.innerText = "Calculate!";

    wrapper.appendChild(yearsOfService);
    wrapper.appendChild(hoursPerWeek);
    wrapper.appendChild(unusedHours);
    wrapper.appendChild(submitButton);
    shadow.appendChild(wrapper);
  }
}

customElements.define("leave-calculator", LeaveCalculator)