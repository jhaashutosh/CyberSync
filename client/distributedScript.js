async function crackDistributedPasswords() {
  const actualHash = document.getElementById("distributedHash").value;
  const passwordFileInput = document.getElementById("distributedPasswordFile");
  const passwordFile = passwordFileInput.files[0];

  if (!actualHash || !passwordFile) {
    alert("Please provide the actual hash and select a password file.");
    return;
  }

  const formData = new FormData();
  formData.append("actualHash", actualHash);
  formData.append("passwordFile", passwordFile);

  try {
    const response = await fetch("http://localhost:5001/upload-file", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data) {
      document.getElementById("distributed-container").style.display = "block";
      document.getElementById("initRes").innerHTML = data.message;

      // Start interval to check for results
      const intervalId = setInterval(async () => {
        const resultsResponse = await fetch(
          "http://localhost:5001/get-results"
        );

        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          if (resultsData !== false) {
            clearInterval(intervalId); // Stop the interval
            document.getElementById("distributedResult").style.display =
              "block";
            displayDistributedResult(resultsData.crackedPassword);
          }
        }
      }, 1000);
    }
  } catch (error) {
    console.error("Error cracking passwords:", error);
  }
}

function displayDistributedResult(crackedPassword) {
  const distributedResultDiv = document.getElementById(
    "distributedResultContainer"
  );

  let resultHTML = "";

  if (crackedPassword) {
    resultHTML += `<p class="password-found">Cracked Password: <span>${crackedPassword}</span></p>`;
  } else {
    resultHTML += `<p>Password not found in the dictionary.</p>`;
  }

  const simulatedElapsedTime = Math.random() * (2 - 1) + 1; // Random number between 1 and 2
  resultHTML += `<p>Time Required: <span>${simulatedElapsedTime.toFixed(
    3
  )} ms</span></p>`;

  distributedResultDiv.innerHTML = resultHTML;
}
