export async function odometerMask(odometer: string) {
    if (odometer != undefined) {
        let newOdometer = await removePoints(odometer)
        if (newOdometer.length <= 3) {
           return newOdometer + ' m'
        } else if (newOdometer.length > 3 && newOdometer.length <= 6) {
            return newOdometer.substring(0, newOdometer.length - 3) + ',' + newOdometer.substring(newOdometer.length - 3, newOdometer.length) + ' Km'
        } else if (newOdometer.length >= 7) {
            switch (newOdometer.length) {
                case 7:
                    return newOdometer.substring(0, newOdometer.length - 6) + '.' + newOdometer.substring(1, newOdometer.length - 3) + ',' + newOdometer.substring(newOdometer.length - 3, newOdometer.length) + ' Km'
                break;
                case 8:
                    return newOdometer.substring(0, newOdometer.length - 6) + '.' + newOdometer.substring(2, newOdometer.length - 3) + ',' + newOdometer.substring(newOdometer.length - 3, newOdometer.length) + ' Km'
                break;
                case 9:
                    return newOdometer.substring(0, newOdometer.length - 6) + '.' + newOdometer.substring(3, newOdometer.length - 3) + ',' + newOdometer.substring(newOdometer.length - 3, newOdometer.length) + ' Km'
                break;
            }
        }
    }
}

export async function removePoints(odometer: string) {
    odometer = odometer.replaceAll(',','').replaceAll('.','')
    return odometer
}