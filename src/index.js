const BASE_WAGE = 200;  // average weekly wage in 1980
const WAGE_RISE = 25;   // average weekly wage rise per year
const CURRENT_YEAR = 2019;

export function getAverageWeeklyWage(year) {
    let numberOfYears = year - 1980;
    let averageWeeklyWage =  BASE_WAGE + (numberOfYears * WAGE_RISE);
    return averageWeeklyWage;
}

export function getAverageYearlyWage(year) {
    return getAverageWeeklyWage(year) * 52.4;
}

export function getRatioToAverageWage(wage) {
    let currentAverageWage = getAverageWeeklyWage(CURRENT_YEAR);
    let ratio = wage / currentAverageWage;
    return ratio;
}

export function getRelativeAverageWeeklyWage(wage, year) {
    let ratio = getRatioToAverageWage(wage);
    let averageWeeklyWage = getAverageWeeklyWage(year);
    return averageWeeklyWage * ratio;
}

export function loadData(successCallback) {
    let governments = undefined;
    let rates = undefined;
    fetch('data/governments.json')
        .then((data) => data.json()).then((data) => {
        //console.log('GOVERNMENTS: ', data);
        governments = data;
        fetch('data/rates.json').then((data) => data.json()).then((data) => {
            //console.log('RATES: ', data);
            rates = data;
            successCallback({
                governments: governments,
                rates: rates
            });
        });
    });
}

export function findBracket(brackets, salary) {
    let bracket = brackets.filter((bracket) => salary >= bracket.from && salary <= bracket.to)[0];
    return bracket;
}

export function calculateTax(brackets, salary) {
    let bracket = findBracket(brackets, salary);
    let taxable = salary - bracket.from;
    let tax = parseInt(bracket.tax) + (parseInt(taxable) * parseFloat(bracket.rate,));
    return tax.toFixed( 2 );
}

export function createBracketByYearMap(rates) {
    let bracketByYear = {};
    rates.forEach((rate) => bracketByYear[parseInt(rate.from)] = rate.bracket);
    return bracketByYear;
}

export function createGovernmentByYearMap(governments) {
    let governmentByYearMap = {};

    governments.forEach(government => {
        let from = parseInt(government.from);
        let to = parseInt(government.to);
        sequence(from, to).forEach(year => {
            governmentByYearMap[year] = government;
        });
    });

    return governmentByYearMap;
}

export function sequence(start, end) {
    let years = [];
    for (let i = start; i<=end; i++) {
        years.push(i);
    }
    return years;
}

export function generateTaxData(bracketsByYear, governmentByYear, wage) {
    let ratio = getRatioToAverageWage(wage).toPrecision(2);
    let result = Object.keys(bracketsByYear).sort()
        .map(year => {
            return {
                year: parseInt(year),
                brackets: bracketsByYear[year]
            }
        }).map(info => {
            let localSalary = Math.round(getAverageYearlyWage(info.year) * ratio);
            let tax = parseInt(calculateTax(info.brackets, localSalary));
            let percentTax = Math.ceil(tax / localSalary * 100);
            let government = governmentByYear[info.year];
            return {...info,
                salary: localSalary,
                tax: tax,
                percentTax: percentTax,
                party: government.party
            }
        }).reduce((map, item) => {
            let y = parseInt(item.year);
            map[y] = item;
            return map;
        }, {});
    return result;
}

export function generateWageTaxData(bracketsByYear, governmentByYear, wages) {
    let wageTaxData = {};
    wages.forEach(wage => {
        wageTaxData[wage] = generateTaxData(bracketsByYear, governmentByYear, wage);
    });
    return wageTaxData;
}

// wageData = {
//     1000: [
//         {year: 1983, percentTax: 23},
//         {year: 1983, percentTax: 23}
//     ],
//     2000: [
//         {year: 1983, percentTax: 23},
//         {year: 1983, percentTax: 23}
//     ]
// };

// graphData = [
//     {year: "1980", 1000: "23", 2000: "52"},
//     {year: "1981", 1000: "22", 2000: "51"}
// ];


export function createGraphData(wageData) {
    let years = sequence(1983, 2018);
    let wages = Object.keys(wageData);

    let graphData = {};

    years.forEach((year) => {
        graphData[year] = {
            year: year
        };
        Object.keys(wageData).forEach((wage) => {
            graphData[year][wage] = parseInt(wageData[wage][year]['percentTax']);
        });
    });

    return Object.values(graphData);
}

export function createGovernmentColorList(governmentByYearMap, start, end) {
    let years = sequence(start,end);
    return years
        .map(year => governmentByYearMap[year])
        .map(gov => gov.party)
        .map(party => {
            return (party === 'Labour' ? 'red' : 'blue');
        });
}

export function addBackground(svgId, colors, x, y, w, h) {
    let svg = d3.select(document.getElementById(svgId));
    colors.forEach((color, i) => {
        svg.append('rect')
            .attr('stroke', 'none')
            .attr('x', x+i*w)
            .attr('y', y)
            .attr('fill-opacity', 0.3)
            .attr('fill', color)
            .attr('width', w)
            .attr('height', h);
    });
}

export function addGraph(title, image, colors, x, y, w, h) {
    let body = d3.select(document.body);
    body.append('h1').text(title);
    let div = body.append('div').attr('class', 'image');
    div.append('img').attr('src', 'images/' + image);
    let svg = div.append('svg');
    colors.forEach((color, i) => {
        svg.append('rect')
            .attr('stroke', 'grey')
            .attr('x', x+i*w)
            .attr('y', y)
            .attr('fill-opacity', 0.3)
            .attr('fill', color)
            .attr('width', w)
            .attr('height', h);
    });
}