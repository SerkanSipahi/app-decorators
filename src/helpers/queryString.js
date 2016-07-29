
/**
 * queryString
 * @author Serkan Sipahi
 */
let queryString = {

    tmpDomain: 'http://localhost',

    /**
     * parse
     * @param {string} query
     * @returns {object} queryObject
     */
    parse(query='') {

        // cleanup
        query = query.trim().replace(/^(\?|#|&)/g, '');

        if(!query || query === ' '){
            return {};
        }

        // init
        let fullURLPath = `${this.tmpDomain}?${decodeURIComponent(query)}`;
        let { searchParams } = new URL(fullURLPath);
        let queryObject = Object.create(null);

        // build
        for(let param of searchParams.entries()){

            let key = param[0];
            let value = param[1] || null;
            let propertyValue = queryObject[key];

            if(!propertyValue && propertyValue !== null){
                queryObject[key] = value;
            } else {
                if(Object.classof(propertyValue) !== 'Array'){
                    queryObject[key] = [ propertyValue ];
                }
                queryObject[key].push(value);
            }
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
