let its  = [];
let only = false;

let it  = (description, test) => its.push([description, test, false]);
it.only = (description, test) => its.push([description, test, true]);
it.skip = description => console.log(`Skip: ${description}`);

let testSuccLog = value => console.log(`Test Ok: ${value}`);
let testFailLog = (value, e) => console.warn(`Failed in: ${value}, Message:`, e.stack, 'Actual: ', e.actual);

it.run = () => {

    if(only) return;

    let _its = its.filter(item => item[2]);
    _its.length && (its = _its);

    for(let [description, test] of its){
        try {
            test();
            testSuccLog(description);
        } catch(e){
            testFailLog(description, e);
        }
    }
};

export { it }