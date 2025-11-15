export default (() => {
  function YourComponent() {
    return <button id="btn">Click me</button>
  }
 
  YourComponent.beforeDOMLoaded = `
  console.log("hello from before the page loads!")
  `
 
  YourComponent.afterDOMLoaded = `
  document.getElementById('btn').onclick = () => {
    alert('button clicked!')
  }
  `
  return YourComponent
}) satisfies QuartzComponentConstructor