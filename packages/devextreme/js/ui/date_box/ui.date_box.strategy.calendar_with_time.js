import { getWidth } from '../../core/utils/size';
import $ from '../../core/renderer';
import { getWindow } from '../../core/utils/window';
const window = getWindow();
import CalendarStrategy from './ui.date_box.strategy.calendar';
import TimeView from './ui.time_view';
import dateLocalization from '../../localization/date';
import { extend } from '../../core/utils/extend';
import dateUtils from '../../core/utils/date';
import Box from '../box';
import uiDateUtils from './ui.date_utils';

const SHRINK_VIEW_SCREEN_WIDTH = 573;
const DATEBOX_ADAPTIVITY_MODE_CLASS = 'dx-datebox-adaptivity-mode';
const DATEBOX_TIMEVIEW_SIDE_CLASS = 'dx-datebox-datetime-time-side';

const CalendarWithTimeStrategy = CalendarStrategy.inherit({

    NAME: 'CalendarWithTime',

    getDefaultOptions: function() {
        return extend(this.callBase(), {
            applyValueMode: 'useButtons',
            buttonsLocation: 'bottom after',
            'dropDownOptions.showTitle': false
        });
    },

    _closeDropDownByEnter: function() {
        return dateUtils.sameDate(this._getContouredValue(), this.widgetOption('value'));
    },

    getDisplayFormat: function(displayFormat) {
        return displayFormat || 'shortdateshorttime';
    },

    _is24HourFormat: function() {
        return dateLocalization.is24HourFormat(this.getDisplayFormat(this.dateBox.option('displayFormat')));
    },

    _getContouredValue: function() {
        const viewDate = this.callBase();
        return this._updateDateTime(viewDate);
    },

    _renderWidget: function() {
        this.callBase();

        this._timeView = this.dateBox._createComponent($('<div>'), TimeView, {
            value: this.dateBoxValue(),
            _showClock: !this._isShrinkView(),
            use24HourFormat: this._is24HourFormat(),
            onValueChanged: this._valueChangedHandler.bind(this),
            stylingMode: this.dateBox.option('stylingMode')
        });

        this._timeView.registerKeyHandler('escape', this._escapeHandler.bind(this));
    },

    renderOpenedState: function() {
        this.callBase();
        const popup = this._getPopup();

        if(popup) {
            popup.$wrapper().toggleClass(DATEBOX_ADAPTIVITY_MODE_CLASS, this._isSmallScreen());
        }

        clearTimeout(this._repaintTimer);

        this._repaintTimer = setTimeout((function() {
            this._getPopup() && this._getPopup().repaint();
        }).bind(this), 0);
    },

    isAdaptivityChanged: function() {
        const isAdaptiveMode = this._isShrinkView();
        const currentAdaptiveMode = this._currentAdaptiveMode;

        if(isAdaptiveMode !== currentAdaptiveMode) {
            this._currentAdaptiveMode = isAdaptiveMode;
            return currentAdaptiveMode !== undefined;
        }

        return this.callBase();
    },

    _updateValue: function(preventDefaultValue) {
        let date = this.dateBoxValue();

        if(!date && !preventDefaultValue) {
            date = new Date();
            uiDateUtils.normalizeTime(date);
        }

        this.callBase();

        if(this._timeView) {
            date && this._timeView.option('value', date);
            this._timeView.option('use24HourFormat', this._is24HourFormat());
        }
    },

    _isSmallScreen: function() {
        return getWidth(window) <= SHRINK_VIEW_SCREEN_WIDTH;
    },

    _isShrinkView: function() {
        return !this.dateBox.option('showAnalogClock') || (this.dateBox.option('adaptivityEnabled') && this._isSmallScreen());
    },

    _getBoxItems: function() {
        const items = [{ ratio: 0, shrink: 0, baseSize: 'auto', name: 'calendar' }];

        if(!this._isShrinkView()) {
            items.push({ ratio: 0, shrink: 0, baseSize: 'auto', name: 'time' });
        }

        return items;
    },

    renderPopupContent: function() {
        this.callBase();
        this._currentAdaptiveMode = this._isShrinkView();

        const $popupContent = this._getPopup().$content();

        this._box = this.dateBox._createComponent($('<div>').appendTo($popupContent), Box, {
            direction: 'row',
            crossAlign: 'stretch',
            items: this._getBoxItems(),
            itemTemplate: (function(data, i, element) {
                const $container = $('<div>');

                switch(data.name) {
                    case 'calendar':
                        $container.append(this._widget.$element());
                        if(this._isShrinkView()) {
                            this._timeView.$element().addClass(DATEBOX_TIMEVIEW_SIDE_CLASS);
                            $container.append(this._timeView.$element());
                        }
                        break;
                    case 'time':
                        $container.append(this._timeView.$element());
                        $(element).addClass(DATEBOX_TIMEVIEW_SIDE_CLASS);
                        break;
                }

                return $container;
            }).bind(this)
        });

        this._attachTabHandler();
    },

    popupConfig: function(popupConfig) {
        const calendarPopupConfig = this.callBase(popupConfig);
        return extend(calendarPopupConfig, { width: 'auto' });
    },

    _attachTabHandler: function() {
        const dateBox = this.dateBox;
        const handler = function(e) {
            if(e.shiftKey) {
                e.preventDefault();
                dateBox.focus();
            }
        };

        this._timeView._hourBox.registerKeyHandler('tab', handler);
    },

    _preventFocusOnPopup: function(e) {
        if(!$(e.target).hasClass('dx-texteditor-input')) {
            this.callBase.apply(this, arguments);
            if(!this.dateBox._hasFocusClass()) {
                this.dateBox.focus();
            }
        }
    },

    _updateDateTime: function(date) {
        const time = this._timeView.option('value');
        date.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());

        return date;
    },

    getValue: function() {
        let date = this._widget.option('value') ?? this._widget.getContouredDate();
        date = date ? new Date(date) : new Date();

        return this._updateDateTime(date);
    },

    dispose: function() {
        clearTimeout(this._removeMinWidthTimer);
        clearTimeout(this._repaintTimer);
        this.callBase();
    }
});

export default CalendarWithTimeStrategy;
