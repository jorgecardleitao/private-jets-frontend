var CSV = {};

(function (my) {
    "use strict";
    my.__type__ = "csv";

    // Convert array of rows in { records: [ ...] , fields: [ ... ] }
    // @param {Boolean} noHeaderRow If true assume that first row is not a header (i.e. list of fields but is data.
    my.extractFields = function (rows, noFields) {
        if (noFields.noHeaderRow !== true && rows.length > 0) {
            return {
                fields: rows[0],
                records: rows.slice(1)
            };
        } else {
            return {
                records: rows
            };
        }
    };

    my.normalizeDialectOptions = function (options) {
        // note lower case compared to CSV DDF
        var out = {
            delimiter: ",",
            doublequote: true,
            lineterminator: "\n",
            quotechar: '"',
            skipinitialspace: true,
            skipinitialrows: 0
        };
        for (var key in options) {
            if (key === "trim") {
                out["skipinitialspace"] = options.trim;
            } else {
                out[key.toLowerCase()] = options[key];
            }
        }
        return out;
    };

    // ## parse
    //
    // For docs see the README
    //
    // Heavily based on uselesscode's JS CSV parser (MIT Licensed):
    // http://www.uselesscode.org/javascript/csv/
    my.parse = function (s, dialect) {
        // When line terminator is not provided then we try to guess it
        // and normalize it across the file.
        if (!dialect || (dialect && !dialect.lineterminator)) {
            s = my.normalizeLineTerminator(s, dialect);
        }

        // Get rid of any trailing \n
        var options = my.normalizeDialectOptions(dialect);
        s = chomp(s, options.lineterminator);

        var cur = "", // The character we are currently processing.
            inQuote = false,
            fieldQuoted = false,
            field = "", // Buffer for building up the current field
            row = [],
            out = [],
            i,
            processField;

        processField = function (field) {
            if (fieldQuoted !== true) {
                // If field is empty set to null
                if (field === "") {
                    field = null;
                    // If the field was not quoted and we are trimming fields, trim it
                } else if (options.skipinitialspace === true) {
                    field = trim(field);
                }

                // Convert unquoted numbers to their appropriate types
                if (rxIsInt.test(field)) {
                    field = parseInt(field, 10);
                } else if (rxIsFloat.test(field)) {
                    field = parseFloat(field);
                }
            }
            return field;
        };

        for (i = 0; i < s.length; i += 1) {
            cur = s.charAt(i);

            // If we are at a EOF or EOR
            if (
                inQuote === false &&
                (cur === options.delimiter || cur === options.lineterminator)
            ) {
                field = processField(field);
                // Add the current field to the current row
                row.push(field);
                // If this is EOR append row to output and flush row
                if (cur === options.lineterminator) {
                    out.push(row);
                    row = [];
                }
                // Flush the field buffer
                field = "";
                fieldQuoted = false;
            } else {
                // If it's not a quotechar, add it to the field buffer
                if (cur !== options.quotechar) {
                    field += cur;
                } else {
                    if (!inQuote) {
                        // We are not in a quote, start a quote
                        inQuote = true;
                        fieldQuoted = true;
                    } else {
                        // Next char is quotechar, this is an escaped quotechar
                        if (s.charAt(i + 1) === options.quotechar) {
                            field += options.quotechar;
                            // Skip the next char
                            i += 1;
                        } else {
                            // It's not escaping, so end quote
                            inQuote = false;
                        }
                    }
                }
            }
        }

        // Add the last field
        field = processField(field);
        row.push(field);
        out.push(row);

        // Expose the ability to discard initial rows
        if (options.skipinitialrows) out = out.slice(options.skipinitialrows);

        return out;
    };

    my.normalizeLineTerminator = function (csvString, dialect) {
        dialect = dialect || {};

        // Try to guess line terminator if it's not provided.
        if (!dialect.lineterminator) {
            return csvString.replace(/(\r\n|\n|\r)/gm, "\n");
        }
        // if not return the string untouched.
        return csvString;
    };

    var rxIsInt = /^\d+$/,
        rxIsFloat = /^\d*\.\d+$|^\d+\.\d*$/,
        trim = (function () {
            // Fx 3.1 has a native trim function, it's about 10x faster, use it if it exists
            if (String.prototype.trim) {
                return function (s) {
                    return s.trim();
                };
            } else {
                return function (s) {
                    return s.replace(/^\s*/, "").replace(/\s*$/, "");
                };
            }
        })();

    function chomp(s, lineterminator) {
        if (s.charAt(s.length - lineterminator.length) !== lineterminator) {
            // Does not end with \n, just return string
            return s;
        } else {
            // Remove the \n
            return s.substring(0, s.length - lineterminator.length);
        }
    }
})(CSV);

export default CSV;
