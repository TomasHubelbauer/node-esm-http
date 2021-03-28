import delay from 'https://raw.githubusercontent.com/tomashubelbauer/esm-delay/main/index.js';

void async function () {
  console.log('Watch the delay:');
  await delay(1000);
  console.log('A second later…');
}()
