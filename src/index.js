/* eslint-disable newline-after-var */
const ui5Utils = require('ui5-testcafe-selector-utils');
const ui5Coverage = ui5Utils.ui5Coverage;
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const libCoverage = require('istanbul-lib-coverage');
const colors = require('colors/safe');

var config = require(process.cwd() + '\\.ui5-testcafe.json');

module.exports = function () {
    return {
        createErrorDecorator() {
            return {
                'span category': () => '',
                'span step-name': str => str,
                'span user-agent': str => str,
                'div screenshot-info': str => str,
                'a screenshot-path': str => str,
                'code': str => str,
                'code step-source': str => str,
                'span code-line': str => `${str}\n`,
                'span last-code-line': str => str,
                'code api': str => str,
                'strong': str => str,
                'a': str => str
            };
        },

        async reportTaskStart() {
        },

        async reportFixtureStart() {
        },

        async reportTestDone() {
        },

        async reportTaskDone() {
            if (!ui5Coverage.hasCoverageInformation()) {
                return;
            }

            const configWatermarks = {
                statements: [50, 80],
                functions: [50, 80],
                branches: [50, 80],
                lines: [50, 80]
            };

            //write coverage output
            const coverageMap = ui5Coverage.getCoverageMap();
            const outDir = config.coverage.outDir ? config.coverage.outDir : '/report/coverage';
            const context = libReport.createContext({
                dir: outDir,
                defaultSummarizer: 'nested',
                watermarks: configWatermarks,
                coverageMap,
            });
            const reportType = config.coverage.type ? config.coverage.type : 'html';
            const report = reports.create(reportType, {
                skipEmpty: false,
                skipFull: false
            });
            report.execute(context);

            //generate summary
            var summary = libCoverage.createCoverageSummary();
            coverageMap.files().forEach(function (f) {
                var fc = coverageMap.fileCoverageFor(f);
                var s = fc.toSummary();
                summary.merge(s);
            });

            const reportData = summary.data;
            console.log(colors.bold('Coverage Summary:'));
            console.table(reportData);
        }
    };
};
