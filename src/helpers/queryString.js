
/**
 * queryString
 */
let queryString = {

    /**
     * parse
     * @param {string} query
     * @returns {object} queryObject
     */
    parse(query='') {

        // cleanup
        query = query.replace(/^\?|#/g, '');

        if(query === ''){
            return {};
        }

        // init
        let fullURLPath = `http://x.x?${encodeURI(query)}`;
        let { searchParams } = new URL(fullURLPath);
        let queryObject = {};

        // build
        for(let param of searchParams.entries()){

            queryObject[param[0]] = param[1];
        }

        return queryObject;
    },

    /**
     * stringify
     * @param {object} queryObject
     * @returns {string} urlpath
     */
    stringify(queryObject) {

        // init
        let urlObject = new URL('http://x.x');
        let queryObjectKeys = Object.keys(queryObject);

        if(!queryObjectKeys.length){
            return '';
        }

        // build
        for(let key of queryObjectKeys){

            let value = queryObject[key];
            urlObject.searchParams.append(
                encodeURI(key),
                encodeURI(value)
            );
        }

        let queryString = urlObject.search.replace(/^\?/g, '');
        return queryString;
    },

};

export {
    queryString
};