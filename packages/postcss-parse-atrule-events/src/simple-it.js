let its = [];

let it = (description, test) => its.push([description, test]);
it.skip = () => '';

it.run  = () => {
  for(let it of its){
      let [description, test] = it;
      try {
          test();
          console.log(`Test Ok: ${description}`);
      } catch(e){
          console.log(`Failed in: ${description}, Message: ${e.message}`);
      }
  }
};

export {
    it,
}