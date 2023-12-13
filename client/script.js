async function crackPasswords() {
  const actualHash = document.getElementById("actualHash").value;
  const passwordFileInput = document.getElementById("passwordFile");
  const passwordFile = passwordFileInput.files[0];

  if (!actualHash || !passwordFile) {
    alert("Please provide the actual hash and select a password file.");
    return;
  }

  const formData = new FormData();
  formData.append("actualHash", actualHash);
  formData.append("passwordFile", passwordFile);

  try {
    const response = await fetch("http://localhost:4001/upload-file", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data);

    setTimeout(() => {
    // Display the result container and update the result
      document.getElementById("result-container").style.display = "block";
      displayResult(
        data.crackedPassword,
        data.totalElapsedTime,
        data.detectedAlgorithm,
        data.message
      );
    }, 2000);

  } catch (error) {
    console.error("Error cracking passwords:", error);
  }
}

function displayResult(
  crackedPassword,
  elapsedTime,
  detectedAlgorithm,
  message
) {
  const resultDiv = document.getElementById("result");

  let resultHTML = "";

  if (detectedAlgorithm !== undefined) {
    resultHTML += `<p class="detected-algorithm">Detected Algorithm: <span>${detectedAlgorithm}</span></p>`;
  } else {
    resultHTML += `<p class="not-detected">Algorithm not detected!</p>`;
  }

  if (crackedPassword) {
    resultHTML += `<p class="password-found">Cracked Password: <span>${crackedPassword}</span></p>`;
  } else {
    resultHTML += `<p>Password not found in the dictionary.</p>`;
  }

  if (elapsedTime !== undefined) {
    resultHTML += `<p>Time Required: <span>${elapsedTime+500} ms</span></p>`;
  }

  resultDiv.innerHTML = resultHTML;
}