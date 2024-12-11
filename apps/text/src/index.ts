import axios from "axios";

async function main() {
  const response = await axios.post("http://localhost:3000/trace/", {
    txHash:
      "0x875a90fdad2fdc86f78eb39c19f927a07e062c74960332f6d49af9c315cec682",
  });

  console.log(response.data);
}

main();
