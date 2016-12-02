/**
 * queryString
 * @author Serkan Sipahi
 */
let queryString = {

    /**
     * parse
     * @param {string} query
     * @returns {object} queryObject
     */
    parse(query = '') {

        // cleanup
        query = query.trim().replace(/^(\?|#|&)/g, '');

        if(!query || query === ' '){
            return {};
        }

        // init
        let searchParams = new URLSearchParams(decodeURIComponent(query));
        let queryObject = Object.create(null);

        // build
        for(let param of searchParams.entries()){

            let key = param[0];
            let value = param[1] || null;
            let propertyValue = queryObject[key];

            // foo=bar&key=val, foo&key
            if(propertyValue === undefined && propertyValue !== null){
                queryObject[key] = value;
            }
            // foo=bar&foo=baz
            else {
                if(this.classof(propertyValue) !== 'Array'){
                    queryObject[key] = [ propertyValue ];
                }
                queryObject[key].push(value);
            }
        }

        return queryObject;
    },

    /**
     * stringify
     * @param queryObject
     * @param encode
     * @returns {string} queryString
     */
    stringify(queryObject = {}, encode = true) {

        // '', 0, 1, [], etc
        if(this.classof(queryObject) !== 'Object'){
            return '';
        }

        // {}
        let queryObjectKeys = Object.keys(queryObject);
        if(!queryObjectKeys.length){
            return '';
        }

        let raw_query = [];
        queryObjectKeys.forEach(key => {

            if(this.classof(queryObject[key]) === 'Array'){

                queryObject[key].forEach(propValue => {
                    // { bar: [undefined, 'baz'] }
                    if(propValue === undefined) return;
                    // bar: [null, 'baz']
                    if(propValue === null){
                        raw_query.push(key);
                    }
                    // { foo: ['bar', 'baz'] }
                    else {
                        raw_query.push(`${key}=${propValue}`)
                    }
                });
                return;

            }
            // { abc: undefined }
            if(queryObject[key] === undefined) return;

            // { 'def': null }
            if(queryObject[key] === null){
                raw_query.push(key);
            }
            // { foo: 'baz' }
            else {
                raw_query.push(`${key}=${queryObject[key]}`);
            }

        });

        let queryString = raw_query.join('&');

        if(encode){
            let { search } = new URL(`http://localhost?${queryString}`);
            queryString = search.replace(/^\?/g, '');
        }

        return queryString;

    },

    classof(value){
        return Object.prototype.toString.call(value).slice(8, -1);
    }

};

export {
    queryString
};
