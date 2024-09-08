import axios from "axios"


async function main(){
const serializedGraphData = await axios.post(
    `http://localhost:5000/trace`,{
    txHash: "0x875a90fdad2fdc86f78eb39c19f927a07e062c74960332f6d49af9c315cec682"
  }
  );
  console.log(serializedGraphData.data);

}

main();