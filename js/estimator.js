const WEEKS = 'weeks';
const MONTHS = 'months';

const covid19ImpactEstimator = (data) => {
    const {
        region,
        reportedCases,
        timeToElapse,
        totalHospitalBeds
    } = data;

    // eslint-disable-next-line no-nested-ternary
    const convertTimeToDays = (et, ptype) => (ptype === WEEKS
        ? (et * 7)
        : ptype === MONTHS
            ? (et * 30)
            : et
    );

    // Calculates 3-Day figure doubling according to time estimation
    const calcInfectedByTime = (currentlyInfected, estimatedTime, periodType) => {
        const estimatedTimeConvert = convertTimeToDays(estimatedTime, periodType);

        const estimatedInfectionsOverTime = currentlyInfected
            * (2 ** Math.trunc((estimatedTimeConvert / 3)));

        return estimatedInfectionsOverTime;
    };

    let currentlyInfected = reportedCases * 10;
    const { periodType } = data;
    let infectionsByRequestedTime = calcInfectedByTime(
        currentlyInfected,
        timeToElapse,
        periodType
    );
    let severeCasesByRequestedTime = 0.15 * infectionsByRequestedTime;
    const availableBeds = 0.35 * totalHospitalBeds;

    let hospitalBedsByRequestedTime = Math.trunc(availableBeds - severeCasesByRequestedTime);
    let casesForICUByRequestedTime = Math.trunc(0.05 * infectionsByRequestedTime);
    let casesForVentilatorsByRequestedTime = Math.trunc(0.02 * infectionsByRequestedTime);

    const { avgDailyIncomeInUSD, avgDailyIncomePopulation } = region;
    let dollarsInFlight = Math.trunc(
        ((infectionsByRequestedTime
                    * avgDailyIncomeInUSD
                    * avgDailyIncomePopulation)
                    / convertTimeToDays(timeToElapse, periodType)
        )
    );

    const impact = {
        currentlyInfected: Math.trunc(currentlyInfected),
        infectionsByRequestedTime: Math.trunc(infectionsByRequestedTime),
        severeCasesByRequestedTime: Math.trunc(severeCasesByRequestedTime),
        hospitalBedsByRequestedTime,
        casesForICUByRequestedTime,
        casesForVentilatorsByRequestedTime,
        dollarsInFlight
    };


    currentlyInfected = reportedCases * 50;
    infectionsByRequestedTime = calcInfectedByTime(currentlyInfected, timeToElapse, periodType);
    severeCasesByRequestedTime = 0.15 * infectionsByRequestedTime;
    hospitalBedsByRequestedTime = Math.trunc(availableBeds - severeCasesByRequestedTime);
    casesForICUByRequestedTime = Math.trunc(0.05 * infectionsByRequestedTime);
    casesForVentilatorsByRequestedTime = Math.trunc(0.02 * infectionsByRequestedTime);
    dollarsInFlight = Math.trunc(
        ((infectionsByRequestedTime
                    * avgDailyIncomeInUSD
                    * avgDailyIncomePopulation)
                    / convertTimeToDays(timeToElapse, periodType)
        )
    );

    const severeImpact = {
        currentlyInfected: Math.trunc(currentlyInfected),
        infectionsByRequestedTime: Math.trunc(infectionsByRequestedTime),
        severeCasesByRequestedTime: Math.trunc(severeCasesByRequestedTime),
        hospitalBedsByRequestedTime,
        casesForICUByRequestedTime,
        casesForVentilatorsByRequestedTime,
        dollarsInFlight
    };

    return { data, impact, severeImpact };
};


const regionData = [
    {
        name: 'Africa',
        avgAge: 19.7,
        avgDailyIncomeInUSD: 5,
        avgDailyIncomePopulation: 0.71
    },

];

// UI data fetch
const getUserData = () => {
    let population = document.querySelector('[data-population]').value;
    let reportedCases = document.querySelector('[data-reported-cases]').value;
    let timeToElapse = document.querySelector('[data-time-to-elapse]').value;
    let periodType = document.querySelector('[data-period-type]').value;
    let totalHospitalBeds = document.querySelector('[data-total-hospital-beds]').value;
    const [region] = regionData;

    return { region, periodType, timeToElapse, reportedCases, population, totalHospitalBeds };
};

let submitButton = document.querySelector('[data-go-estimate]');
submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    let udata = getUserData();
    let propnames = Object.getOwnPropertyNames(udata);

    let loadingImg = document.querySelector('#loading');
        loadingImg.style.display = 'block';
        loadingImg.classList.add('loading'); 
    
    setTimeout(() => loadingImg.style.display = 'none', 1500);

    for (let i = 0; i < propnames.length; i++) 
        if(udata[propnames[i]] === '') return;

    console.log(covid19ImpactEstimator(udata));
});

