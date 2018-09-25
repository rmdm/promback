module.exports = using(Promise)

module.exports.using = using

function using (PromiseLib) {

    return function (fn) {

        if (typeof fn !== 'function') {
            throw new Error('A function is required to promback.')
        }

        return function (... args) {

            const that = this

            return new PromiseLib(function (resolve, reject) {

                const result = fn.call(that, ... args, function (err, value) {
                    if (err) { reject(err) }
                    resolve(value)
                })

                if (typeof result !== 'undefined') {
                    resolve(result)
                }
            })
        }
    }
}
