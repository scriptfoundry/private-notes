export const classNames =  (obj) => {
	return Object.keys(obj)
		.reduce((strings, key) => obj[key] ? [...strings, key]: strings, [])
		.join(' ');
};

export const delay = (interval) => new Promise((resolve)=> setTimeout(resolve, interval));

export const memoize = (fn, size = 3) => {
    let cache = [];

    return (...args) => {
        let match = cache.find(({args: cachedArgs}) => cachedArgs.length === args.length && cachedArgs.every((entryArg, index) => entryArg === args[index]));

        if (match) return match.results;

        let results = fn(...args);
        cache = [{args, results}, ...cache.slice(0, size - 1)];

        return results;
    };
};

export const makeSorter = (comp) => (arr) => arr
    .map((item, index) => ({item, index}))
    .sort((a, b) => comp(a.item, b.item))
    .map(({item}) => item);

export const timestampToDate = timestamp => {
    const date = new Date(timestamp);
    return `${ date.toLocaleDateString() } ${ date.toLocaleTimeString() }`;
};

export const sortByDate = makeSorter((a, b) => {
    a = Math.max(a.updated || 0, a.created);
    b = Math.max(b.updated || 0, b.created);
    return a > b ? -1 : 1;
});

export const calculateMaxEntropy = input => {
    const tests = [ { test: /[a-z]/, characters: 26 }, { test: /[A-Z]/, characters: 26 }, { test: /[0-9]/, characters: 10 }, { test: /[!@#$%^&*()]/i, characters: 10 }, { test: /["`~_=+[{};|:'^,<.>/?\]\\-]/, characters: 23 } ];
    const pool = tests.reduce((pool, {test, characters}) => test.test(input) ? pool + characters : pool, 0);

    return Math.log2(pool) * input.length;
};
export const calculateMaxEntropyLabel = input => {
    const entropy = calculateMaxEntropy(input);
    const values = [ { bits: 32, label: 'Weak' }, { bits: 46, label: 'Reasonable' }, { bits: 60, label: 'Strong' }, { bits: 128, label: 'Very strong' } ];
    return values.reduce((c, {bits, label}) => entropy > bits ? label : c, 'Very weak');
};
export const buildComparator = (fields=[]) => (a, b) => a && b && fields.every(field => a[field] === b[field]);

export const noop = () => {};