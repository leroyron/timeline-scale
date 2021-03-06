/**
 * Building Calendar Class: Phases
 * @author leroyron / http://leroy.ron@gmail.com
 */
(function (Calendar) {
    // Class Struct prototype
    var _struct = Calendar.prototype
    var that = _struct.phases = {}
    // Class Declarations

    // Private

    // Public
    that.params = [
        // DAY
        ['year', 'yearNamesSparse', 0, 8, 50, ['quarter', 'quarterNames', 0.3, 3], 0, undefined, 14],
        ['month', 'monthNamesShort', 1.0, 12, 75, ['week', 'weekNames', 1.5, 7], 0, 'bandWidthDays', 12],
        ['day', 'dayNames', 2.0, 'daysInMonth', 10, ['morningNoon', 'morningNoonNames', 2.5, 12], 'firstDayOfMonth', undefined, 8],
        // TIME
        ['hour', 'hour24AmPm', 3.0, 24, 10, ['tenMinutes', 'min', 3.1, 10, 10], 0, undefined, 12, true],
        ['minute', 'min', 4.0, 60, 5, ['tenSeconds', 'sec', 4.1, 10, 10], 0, undefined, 8, true],
        ['second', 'sec', 5.0, 60, 1, ['tenMilliseconds', 'milli', 5.1, 10, 10], 0, undefined, 8],
        ['millisecond', undefined, 6.0, 100, 1, [], 0, undefined, 8]
    ]

    // Class Init
    that.Init = function (calendar, phase) {
        // Private

        // Public
        // DAY
        // year <> quarters
        this.yearNamesSparse = function (f) {
            var v = calendar.current.year
            var b = calendar.phases.frequencies.year.bands
            var arr = []
            for (let i = 0; i < b; i++) { arr[i] = v + (i - (b / 2)) }
            calendar.phases.frequencies.year.labelNameList = 'yearNamesSparse'
            calendar.phases.frequencies.year.labelNameListIsFunction = false
            calendar.phases.yearNamesSparse = arr
            return arr[0]
        }
        this.quarterNames = ['Q1', 'Q2', 'Q3', 'Q4']
        this.getQuarterName = function (i, b) { return b ? this.quarterNamesShort[i] : this.quarterNames[i] }
        this.quartersInYear = 4
        this.monthsInQuarter = 3
        // year <> months
        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        this.monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        this.getMonthName = function (i, b) { return b ? this.monthNamesShort[i] : this.monthNames[i] }
        this.weeksInMonth = function (y, m) { Math.ceil((this.firstDayOfMonth(y, m) + this.daysInMonth(y, m)) / 7) }
        this.weekNames = ['Sunday-', 'Sun-', '', '', '']
        // month <> days
        this.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        this.dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        this.morningNoonNames = ['Morning', 'Afternoon']
        this.getDayName = function (i, b) { return b ? this.dayNamesShort[i] : this.dayNames[i] }
        this.iterate7 = function (i, f) { return (i - f) % 7 == 0 }
        this.firstDayOfMonth = function (y, m) { return new Date((y || calendar.current.year) + '-' + (m || calendar.current.month) + '-' + 1).getDay() }
        this.daysInMonth = function (y, m) { if (!y && !m) return 31; return new Date((y || calendar.current.year), (m || calendar.current.month), 0).getDate() }
        this.bandWidthDays = function () { return [27, 28, 29, 30, 31, 32] }
        // time in day
        // TIME
        // days <> hours
        this.hour24AmPm = function (f) {
            calendar.phases.frequencies.hour.hour24Format = calendar.current.hour24Format
            var arr = ['am', 'pm']
            calendar.phases.frequencies.hour.labelNameList = 'hour24AmPm'
            calendar.phases.frequencies.hour.labelNameListIsFunction = false
            calendar.phases.hour24AmPm = arr
            return arr[0]
        }
        this.hour24Format = false
        this.hoursInDay = 24
        // hours <> minutes
        this.min = ['min']
        this.minutesInHour = 60
        // minutes <> seconds
        this.sec = ['sec']
        this.secondsInMinute = 60
        // seconds <> milliseconds
        this.milli = ['ms']
        this.millisecondsInSecond = 100
        // timestamps
        this.timestamp = {
            start: undefined,
            end: undefined,
            current: undefined,
            seconds: {
                year: 31557600,
                month: function (y, m) { return this.timestamp.seconds.day * this.daysInMonth(y, m) },
                day: 86400,
                hour: 3600,
                minute: 60
            },
            now: function () { return Date.now() / 1000 | 0 }
        }

        this.enter = function (obj, year, month, day, hour, minute, second, millisecond) {
            obj = obj || this.last
            for (let f = 0; f < this.active.frequencies.length; f++) {
                obj[this.active.frequencies[f]] = this[this.active.frequencies[f]] ? this[this.active.frequencies[f]] : this.last[this.active.frequencies[f]]
                /* obj.month = month ? month : this.last.month
                obj.day = day ? day : this.last.day
                obj.hour = hour ? hour : this.last.hour
                obj.minute = minute ? minute : this.last.minute
                obj.second = second ? second : this.last.second
                obj.millisecond = millisecond ? millisecond : this.last.millisecond */
            }
            //
            obj.quartersInYear = this.active.quartersInYear
            obj.monthsInQuarter = this.active.monthsInQuarter
            obj.weeksInMonth = this.active.weeksInMonth(obj.year, obj.month)
            obj.firstDayOfMonth = this.active.firstDayOfMonth(obj.year, obj.month)
            obj.daysInMonth = this.active.daysInMonth(obj.year, obj.month)

            this.last = obj
            return obj
        }

        this.getfrequencyName = function (phase) {
            var paramsLen = Object.keys(this.frequencies).length
            var frequencyId = paramsLen

            // assign the current frequency bands for render
            if (typeof phase != 'undefined') {
                if (isNaN(phase)) { frequencyId = this.frequencies[phase].phase } else if (!isNaN(phase)) { frequencyId = Math.floor(phase / (100 / paramsLen)) }
            }
            return this.frequencies[Object.keys(this.frequencies)[this.total - frequencyId]].name
        }

        this.getfrequencyScale = function (phase) {
            var paramsLen = Object.keys(this.frequencies).length
            return paramsLen - this.getfrequencyId(phase)
        }

        this.getfrequencyId = function (phase) {
            var paramsLen = Object.keys(this.frequencies).length
            var frequencyId = paramsLen

            // assign the current frequency bands for render
            if (typeof phase != 'undefined') {
                if (isNaN(phase)) { frequencyId = this.frequencies[phase].phase } else if (!isNaN(phase)) { frequencyId = Math.ceil(phase / (100 / paramsLen)) }
            }
            return frequencyId
        }

        this.frequencies = {}
        this.refrequency = function (phase) {
            this.total = that.params.length
            this.phase = phase
            this.phaseId = this.getfrequencyId(phase)
            this.previous = Object.keys(this.frequencies)[this.total - this.phaseId - 1]
            this.previousFrequency = this.frequencies[this.previous]

            this.current = Object.keys(this.frequencies)[this.total - this.phaseId]
            this.currentFrequency = this.frequencies[this.current]

            this.currentFrequency.subLength = Object.keys(this.currentFrequency.sub).length

            this.next = Object.keys(this.frequencies)[this.total - this.phaseId + 1]
            this.nextFrequency = this.frequencies[this.next]
        }
        this.multipleScale = 10
        this.rephase = function (phase) {
            this.total = that.params.length
            this.multipleScalePhases = this.total * this.multipleScale
            var changePhase = 100 / this.total
            // generate phase parameters
            this.subRephase = function (subPhase) {
                if (!subPhase) return
                var spLen = subPhase.length / 4
                var spArray = {}
                for (let sp = 0; sp < spLen; sp += 5) {
                    spArray[subPhase[sp]] = {name: subPhase[sp], labelNameList: typeof this[subPhase[sp + 1]] != 'function' ? subPhase[sp + 1] : this[subPhase[sp + 1]], indice: subPhase[sp + 2], freq: subPhase[sp + 3], first: subPhase[sp + 4]}
                }
                return spArray
            }
            var subReset = function (reset) {
                if (reset) {
                    calendar.ctx.style.toggle.freqs.label.visibility = 'visible'
                    calendar.ctx.style.toggle.freqs.band.label.visibility = 'hidden'
                } else {
                    calendar.ctx.style.toggle.freqs.label.visibility = 'hidden'
                    calendar.ctx.style.toggle.freqs.band.label.visibility = 'visible'
                }
            }
            var subCheck = function (p, sLen) {
                if (calendar.ctx.style.toggle.freqs.label.visibility == 'visible') {
                    if (p >= this.sub[Object.keys(this.sub)[sLen]].indice) { this.subToggle() }
                } else {
                    if (p < this.sub[Object.keys(this.sub)[sLen]].indice) { this.subToggle() }
                }
            }
            var subToggle = function () {
                if (calendar.ctx.style.toggle.freqs.label.visibility == 'visible') {
                    calendar.ctx.style.toggle.freqs.label.visibility = 'hidden'
                    calendar.ctx.style.toggle.freqs.band.label.visibility = 'visible'
                } else {
                    calendar.ctx.style.toggle.freqs.label.visibility = 'visible'
                    calendar.ctx.style.toggle.freqs.band.label.visibility = 'hidden'
                }
            }
            for (let p = 0; p < this.total; p++) {
                this.frequencies[that.params[p][0]] = {
                    name: that.params[p][0],
                    phase: this.total - p,
                    labelNameList: typeof this[that.params[p][1]] != 'function' ? that.params[p][1] : this[that.params[p][1]],
                    indice: that.params[p][2],
                    getBands: isNaN(that.params[p][3]) ? this[that.params[p][3]] : that.params[p][3],
                    _bands: isNaN(that.params[p][3]) ? this[that.params[p][3]]() : that.params[p][3],
                    get bands () {
                        return (this._bands = typeof this.getBands != 'function' ? this._bands : this.getBands(this.year, this.month))
                    },
                    set bands (val) {
                        return (this._bands = val)
                    },
                    range: {length: that.params[p][8], locator: 0},
                    span: that.params[p][4],
                    sub: this.subRephase(that.params[p][5]),
                    subCheck: subCheck,
                    subToggle: subToggle,
                    subReset: subReset,
                    getFirst: isNaN(that.params[p][6]) ? this[that.params[p][6]] : that.params[p][6],
                    _first: that.params[p][6],
                    get first () {
                        return (this._first = typeof this.getFirst != 'function' ? this._first : this.getFirst(this.year, this.month))
                    },
                    set first (val) {
                        return (this._first = val)
                    },
                    // startFunc: this.iterate7,
                    change: changePhase * (p + 1),
                    bandWidths: isNaN(that.params[p][7]) ? this[that.params[p][7]] : that.params[p][7] ? [that.params[p][7]] : undefined,
                    rescale: that.params[p][9]
                }
                if (p == 0) this.mainFrequency = this.frequencies[that.params[p][0]]
            }
            this.refrequency(phase)
        }

        this.rephase(that.params[0][0])
    }
})(this.Calendar)
