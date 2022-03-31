
export const conversion_units = {
    'si': {
        temp: 'C'
    },
    'us': {
        temp: 'F'
    }
}

export const convert_units = (unit_from, unit_to, value) => {
    unit_from = unit_from.toUpperCase()
    if (unit_from == unit_to) { return value }
    
    if (unit_from == 'F' && unit_to == 'C') {
        return (value - 32) * 5 / 9
    }

    if (unit_from == 'C' && unit_to == 'F') {
        return value * 9 / 5 + 32
    }
}