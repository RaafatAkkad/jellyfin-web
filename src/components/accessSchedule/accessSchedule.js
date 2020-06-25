/* eslint-disable indent */

/**
 * Module for controlling user parental control from.
 * @module components/accessSchedule/accessSchedule
 */

import dialogHelper from 'dialogHelper';
import datetime from 'datetime';
import globalize from 'globalize';
import 'emby-select';
import 'paper-icon-button-light';
import 'formDialogStyle';

    function getDisplayTime(hours) {
        let minutes = 0;
        const pct = hours % 1;

        if (pct) {
            minutes = parseInt(60 * pct);
        }

        return datetime.getDisplayTime(new Date(2000, 1, 1, hours, minutes, 0, 0));
    }

    function populateHours(context) {
        let html = '';

        for (let i = 0; i < 24; i++) {
            html += `<option value="${i}">${getDisplayTime(i)}</option>`;
        }

        html += `<option value="24">${getDisplayTime(0)}</option>`;
        context.querySelector('#selectStart').innerHTML = html;
        context.querySelector('#selectEnd').innerHTML = html;
    }

    function loadSchedule(context, {DayOfWeek, StartHour, EndHour}) {
        context.querySelector('#selectDay').value = DayOfWeek || 'Sunday';
        context.querySelector('#selectStart').value = StartHour || 0;
        context.querySelector('#selectEnd').value = EndHour || 0;
    }

    function submitSchedule(context, options) {
        const updatedSchedule = {
            DayOfWeek: context.querySelector('#selectDay').value,
            StartHour: context.querySelector('#selectStart').value,
            EndHour: context.querySelector('#selectEnd').value
        };

        if (parseFloat(updatedSchedule.StartHour) >= parseFloat(updatedSchedule.EndHour)) {
            return void alert(globalize.translate('ErrorMessageStartHourGreaterThanEnd'));
        }

        context.submitted = true;
        options.schedule = Object.assign(options.schedule, updatedSchedule);
        dialogHelper.close(context);
    }

    export function show(options) {
        return new Promise((resolve, reject) => {
            // TODO: remove require
            require(['text!./components/accessSchedule/accessSchedule.template.html'], template => {
                const dlg = dialogHelper.createDialog({
                    removeOnClose: true,
                    size: 'small'
                });
                dlg.classList.add('formDialog');
                let html = '';
                html += globalize.translateDocument(template);
                dlg.innerHTML = html;
                populateHours(dlg);
                loadSchedule(dlg, options.schedule);
                dialogHelper.open(dlg);
                dlg.addEventListener('close', () => {
                    if (dlg.submitted) {
                        resolve(options.schedule);
                    } else {
                        reject();
                    }
                });
                dlg.querySelector('.btnCancel').addEventListener('click', () => {
                    dialogHelper.close(dlg);
                });
                dlg.querySelector('form').addEventListener('submit', event => {
                    submitSchedule(dlg, options);
                    event.preventDefault();
                    return false;
                });
            });
        });
    }

/* eslint-enable indent */

export default {
    show: show
};
