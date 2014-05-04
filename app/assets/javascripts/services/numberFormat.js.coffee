app.factory('numberFormatter', () ->
  # options listed here in order of increasing precedence:
  #
  # maxPrecision: maximum number of decimal digits.
  # fixedPrecision: always have this many decimal digits.
  # minSigFigs: always have this many significant figures.
  # abbrPrecision: maximum number of decimals in an abbreviated number. uses
  #                maxPrecision if not set, and 2 if that's not set.
  #
  # maxLength: maximum display length in nonsymbol chars. will abbreviate
  #            if necessary.
  #
  # suppressGroups: don't add the thousands/millions/etc markers.
  # fullTextMutliplier: if not suppressing groups, use full text multipliers vs abbreviated multipliers
  # currency: the optional currency string to format.
  formatNumber = (num, options = {}) ->
    if options.maxPrecision?
      # trim down precision as a number so that underprecision doesn't
      # overexpress.
      factor = Math.pow(10, options.maxPrecision)
      num = Math.round(num * factor) / factor

    # drop to string for the rest of our work..
    abbr = 0
    [ wholes , decimals ] = numberToString(num).split('.')
    negative =
      if wholes.substring(0, 1) is '-'
        wholes = wholes.substring(1)
        '-'
      else
        ''
    decimals ?= ''

    # pad the decimals to fixedPrecision by default.
    if options.fixedPrecision? or options.minSigFigs?
      precision = options.fixedPrecision ? 0
      if options.minSigFigs?
        # note: technically a violation of the strict definition of sig fig.
        # but this is the version we care about for formatting.
        precision = Math.max(precision, options.minSigFigs - wholes.length + (if wholes is '0' then 1 else 0))

    decimals = (decimals + (new Array((precision ? 0) + 1)).join('0')).substring(0, precision)

    # this will be how the final number is rendered:
    render = (separators = true) ->
      groupSep = if separators is true and options.suppressGroups isnt true then ',' else ''
      decSep = if separators is true and decimals.length > 0 then '.' else ''
      multipliers = if options.fullTextMultiplier? then ['', ' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion'] else
        [ '', 'K', 'M', 'B', 'T', 'Qd', 'Qt' ]
      multiplier = if separators is true then multipliers[abbr] else ''
      (options.currency ? '') + "#{negative}#{wholes.join(groupSep)}#{decSep}#{decimals}" + multiplier

    # we want to break into groups unless we have no maxlength AND the user
    # wants no groups.
    if options.maxLength? or options.suppressGroups isnt false

      # define some things we'll need.
      group = 0
      remainingWholes = wholes
      wholes = []

      # TODO I ripped out i18n here.
      rules = { "number": { "groups" : { '...': 3 } } }
      getGroup = (x) -> rules.number.groups[group] ? rules.number.groups['...']

      # break our wholes into groups no matter what.
      while remainingWholes.length > getGroup(group)
        idx = remainingWholes.length - getGroup(group)

        wholes.unshift(remainingWholes.substring(idx))
        remainingWholes = remainingWholes.substring(0, idx)

        group = group + 1

      wholes.unshift(remainingWholes) if remainingWholes.length > 0

      # if we need to abbreviate, loop until we can fit.
      if options.maxLength?
        precision = options.abbrPrecision ? precision ? 2

        loop
          decimals = decimals.substring(0, precision)
          break if render(false).length <= options.maxLength

          # we're too long for whatever reason. do what we can..
          if wholes.length > 1
            abbr = abbr + 1
            decimals = wholes.pop() + decimals
          else if precision > 0
            # need to properly round up or down as we lose precision.
            if precision > 1
              decimals = numberToString(Math.round(parseInt(decimals) / 10))
            else
              wholes[wholes.length - 1] = numberToString(Math.round(parseFloat("#{_.last(wholes)}.#{decimals}")))

            precision -= 1
          else
            # nothing else to be done; we're as short as can be.
            break

    else
      # render expects this to be an array.
      wholes = [ wholes ]

    # return our final render.
    render()

  # http://stackoverflow.com/questions/1685680/how-to-avoid-scientific-notation-for-large-numbers-in-javascript
  numberToString = (x) ->
    if Math.abs(x) < 1.0
      [ __, e ] = x.toString().split('e-')
      e = parseInt(e)

      if !_.isNaN(e)
        x = x * Math.pow(10, e - 1)
        x = "0.#{(new Array(e)).join('0')}#{x.toString().substring(2)}"
    else
      [ __, e ] = x.toString().split('+')
      e = parseInt(e)

      if e > 20
        e = e - 20
        x = x / Math.pow(10, e)
        x = "#{x}#{(new Array(e + 1)).join('0')}"

    x.toString()

  return { formatNumber: formatNumber, numberToString: numberToString }
)
