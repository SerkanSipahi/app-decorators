let its = [];

let it = (description, test) => its.push([description, test]);
it.skip = () => '';

it.run  = () => {
  for(let it of its){
      let [description, test] = it;
      try {
          test();
          console.log(`Test: ${description}`);
      } catch(e){
          console.log(`Failed: ${description}`, e.message);
      }
  }
};

export {
    it,
}