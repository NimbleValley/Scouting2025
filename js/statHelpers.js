function getMean(array) {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, val) => acc + val, 0);
    return sum / array.length;
}

function getMedian(array) {
    if (array.length === 0) return 0;
    const sorted = [...array].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        return sorted[mid];
    }
}

function getMax(array) {
    if (array.length === 0) return 0;
    return Math.max(...array);
}

function getMin(array) {
    if (array.length === 0) return 0;
    return Math.min(...array);
}

function getPercentile(array, percentile) {
    if (!array.length) return 0;

    const sorted = [...array].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
        return sorted[lower];
    }

    // Linear interpolation
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}