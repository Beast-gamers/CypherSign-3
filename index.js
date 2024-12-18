const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 3000;
const DATA_FILE = 'users.txt';
const VERIFICATION_FILE = 'verifications.txt'; // File to store unverified users

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse cookies
app.use(cookieParser());

// Serve static files like HTML, CSS
app.use(express.static('public'));

// Function to generate a random 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();  // Generates a random 6-digit number
}

// Function to send verification email
function sendVerificationEmail(email, verificationCode) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'saim3dballs@gmail.com',
                pass: 'sngq hflg czhu pbvv',
            },
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Account Verification',
            text: `Your verification code is: ${verificationCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
}

// Function to check if the user exists in either users.txt or verifications.txt
function checkIfUserExists(username, email, callback) {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading verification file:', err);
            callback(true);
            return;
        }

        const users = (data || '').split('\n').filter(Boolean).map(line => {
            const [user, email, ,] = line.split(':');
            return { user, email };
        });

        const exists = users.some(user => user.user === username || user.email === email);
        callback(exists);
    });
}

// Serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Signup route

// Serve verification page
app.get('/verification', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verification.html'));
});



// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading user data');
        }

        const users = data.split('\n').filter(Boolean).map(line => {
            const [user, email, password] = line.split(':');
            return { user, email, password };
        });

        const user = users.find(u => u.user === username && u.password === password);

        if (user) {
            // Set a session cookie to mark the user as logged in
            res.cookie('sessionToken', username, { httpOnly: true, maxAge: 3600000 });  // 1 hour expiry
            res.redirect('/loggedin');
        } else {
            return res.redirect('/login?error=Invalid credentials');
        }
    });
});

// Redirect to the correct page based on whether the user is logged in
app.get('/', (req, res) => {
    const sessionToken = req.cookies.sessionToken;

    if (sessionToken) {
        // If sessionToken exists, the user is logged in
        res.redirect('/loggedin');
    } else {
        // If sessionToken doesn't exist, the user is not logged in
        res.redirect('/signup');
    }
});




    // Logout route (now using POST for logout)
app.post('/logout', (req, res) => {
    res.clearCookie('sessionToken');  // Clear the session cookie
    res.redirect('/login');  // Redirect to login after logout
});
    
    // Send the dynamic page as the response
    



// Verify the code from the user
app.post('/verify', (req, res) => {
    const { username, email, verificationCode } = req.body;

    fs.readFile(VERIFICATION_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error verifying user');
        }

        const users = data.split('\n').filter(line => line.trim()).map(line => {
            const [user, emailAddr, password, p1, p2, code] = line.split(':').map(item => item.trim());
            return { user, email: emailAddr, password, p1, p2, code };
        });

        const userIndex = users.findIndex(user => 
            user.user === username && user.email === email && user.code === verificationCode
        );

        if (userIndex === -1) {
            return res.redirect('/verification?error=Invalid verification code or email');
        }

        const { user, email: verifiedEmail, password, p1, p2 } = users[userIndex];

        // Store user in users.txt
        const userLine = `${user}:${verifiedEmail}:${password}:${p1}:${p2}\n`;
        fs.appendFile(DATA_FILE, userLine, (err) => {
            if (err) {
                return res.status(500).send('Error saving user data');
            }

            // Remove the user from the verification list after successful verification
            users.splice(userIndex, 1);
            const updatedData = users.map(u => `${u.user}:${u.email}:${u.password}:${u.p1}:${u.p2}:${u.code}`).join('\n');

            fs.writeFile(VERIFICATION_FILE, updatedData, (err) => {
                if (err) {
                    return res.status(500).send('Error updating verification file');
                }

                res.redirect('/login');
            });
        });
    });
});


app.get('/loggedin', (req, res) => {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
        return res.redirect('/login');  // If no session token, redirect to login
    }

    // The username is stored in the sessionToken (cookie)
    const username = sessionToken;

    // Read from users.txt to fetch the corresponding user data
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading user data');
        }

        const users = data.split('\n').filter(Boolean).map(line => {
            const [user, email, password, p1, p2] = line.split(':');
            return { user, email, password, p1, p2 };
        });

        // Find the user data for the logged-in user
        const user = users.find(u => u.user === username);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Generate the logged-in page with the username, p1, and p2
        const loggedInPage = `
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Added viewport meta tag for responsiveness -->
    <meta charset="UTF-8">
    <title>CipherSign</title>
    <link rel="stylesheet" href="./styles.css">
</head>

<body>
  
    <section>
         <button id="decrypt-btn" style="visibility: hidden;">Decrypt</button>
        <button id="process-btn" style="visibility: hidden;">Process and Encrypt</button>
        <button id="encrypt-btn"  style="display: none;" style="visibility: hidden;">Encrypt</button>
        <button id="generate-pq" style="visibility: hidden;">Generate p and q</button>
        <p id="pq-values"></p>
        <p id="pq-values"></p>
        <p id="rsa-keys"></p>
        <button onclick="divideByTwo()" style="visibility: hidden;">Divide by 2</button>
        <button onclick="removeComma()" style="visibility: hidden;">Remove Commas</button>
        <button onclick="removeSpaces()" style="visibility: hidden;">Remove Spaces</button>
        <button onclick="convertDegreeToSpace()" style="visibility: hidden;">Convert Degree to Space</button>
        <p id="formatted-output" style="visibility: hidden;"></p>
        <p style="display: none;" id="decrypted-value"></p>
        <p style="display: none;" id="encrypted-value"></p>

      
         <div class="signin">
            <div class="content">

                
                <div class="form">
       
                    <h2>Your Public Key is:</h2>
                    <!-- First input box with ${user.p2} value -->
                     <div class="inputBox p2Box">
                        <input type="text" value="${user.p1}" id="p2Input" readonly>
                        <button class="copy-btn" onclick="copyToClipboard('p2Input')">Copy</button>
                    </div>

                    <!-- Encrypt and Decrypt input boxes side by side -->
                    <div class="encryptDecryptBox">
                        <div class="inputBox">
                            <button id="encrypt-btn"  style="display: none;" style="visibility: hidden;">Encrypt</button>
 
                            <h2>Encrypt</h2>
                            <input type="text" id="encrypt-key" placeholder="Enter Public Key">
                            <i>a</i>
                            <input type="text" id="format-input" placeholder="Enter Message">
                            <i>a</i>
                            <p id="encrypted-value"></p>
        
                                <input type="submit" id="process-and-encrypt-btn" value="Encrypt">
                 
                            <i>a</i>
                            <input type="text" id="encrypted" placeholder="encrypted output" readonly>
                            <i>a</i>
                             <input type="submit" onclick="copyToClipboard('encrypted')" value="Copy">
                        </div>

                       <div class="inputBox">
    <h2>Decrypt</h2>
    <input id="decrypt-key" type="text" style="visibility: hidden;" value="${user.p2}">
      <i>a</i>
      <input id="decrypt-value" type="text" placeholder="Enter Message">
      <i>a</i>
      <div>
          <input type="submit" onclick="executeDecryptionProcess()" id="process-and-encrypt-btn" value="Decrypt">
                 
       </div>
     <i>a</i>
     <input id="decrypted" type="text" placeholder="decrypted output" readonly>
                           <i>a</i>
      <input type="submit" onclick="copyToClipboard('decrypted')" value="Copy">
                  
      
                           
    
      </div>
  </div>
        <div class="inputBox">
        <form action="/logout" method="post">
        
        <input type="submit" value="Logout">
    </form>
        
                   </div>
                </div>
            </div>
        </div>
        
    </section>
       
        
        
        
        
    
<script src="scripts.js"></script>
    <script src="script.js"></script>


</body>

</html>
        `;
        
        // Send the logged-in page with the user data
        res.send(loggedInPage);
    });
});


// Signup route
app.post('/signup', (req, res) => {
    const { username, password, email, p1, p2 } = req.body;
    const verificationCode = generateVerificationCode();  // Generate a 6-digit verification code

    // Check if username or email already exists in users.txt
    checkIfUserExists(username, email, (exists) => {
        if (exists) {
            return res.redirect('/signup?error=Username or email already exists.');
        }

        // Check if username or email exists in verifications.txt
        fs.readFile(VERIFICATION_FILE, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Error checking verification file');
            }

            const users = data.split('\n').filter(line => line.trim()).map(line => {
                const [user, emailAddr, password, p1, p2, code] = line.split(':').map(item => item.trim());
                return { user, email: emailAddr, password, p1, p2, code };
            });

            // Find if the username or email exists in the verification list
            const existingUserIndex = users.findIndex(user => user.user === username || user.email === email);

            if (existingUserIndex !== -1) {
                // If user exists in the verification file, remove the old entry
                users.splice(existingUserIndex, 1);
                const updatedData = users.map(u => `${u.user}:${u.email}:${u.password}:${u.p1}:${u.p2}:${u.code}`).join('\n');

                fs.writeFile(VERIFICATION_FILE, updatedData, (err) => {
                    if (err) {
                        return res.status(500).send('Error updating verification file');
                    }

                    // Proceed to add the new user to the verification list
                    const userLine = `${username}:${email}:${password}:${p1}:${p2}:${verificationCode}\n`;

                    fs.appendFile(VERIFICATION_FILE, userLine, (err) => {
                        if (err) {
                            return res.status(500).send('Error saving user data');
                        }

                        // Send the verification email
                        sendVerificationEmail(email, verificationCode)
                            .then(() => {
                                res.redirect('/verification');
                            })
                            .catch((error) => {
                                return res.redirect('/signup?error=Error sending verification email');
                            });
                    });
                });
            } else {
                // If the user doesn't exist in the verification file, proceed as usual
                const userLine = `${username}:${email}:${password}:${p1}:${p2}:${verificationCode}\n`;

                fs.appendFile(VERIFICATION_FILE, userLine, (err) => {
                    if (err) {
                        return res.redirect('Error saving user data');
                    }

                    // Send the verification email
                    sendVerificationEmail(email, verificationCode)
                        .then(() => {
                            res.redirect('/verification');
                        })
                        .catch((error) => {
                            return res.redirect('Error sending verification email');
                        });
                });
            }
        });
    });
});


// Process Forgot Password (send verification email and save user data to change.txt)
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const verificationCode = generateVerificationCode();  // Generate OTP

    // Find user in change.txt (if already exists) and remove it
    fs.readFile('change.txt', 'utf8', (err, changeData) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).send('Error reading change.txt');
        }

        let changeUsers = changeData ? changeData.split('\n').filter(Boolean) : [];
        
        // Remove any existing user with the same email from change.txt
        changeUsers = changeUsers.filter(line => {
            const [user, userEmail, password, p1, p2, code] = line.split(':');
            return userEmail !== email;  // Keep users that do not have the same email
        });

        // Now, find the user in users.txt
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Error reading user data');
            }

            const users = data.split('\n').filter(Boolean).map(line => {
                const [user, userEmail, password, p1, p2] = line.split(':');
                return { user, email: userEmail, password, p1, p2 };
            });

            const user = users.find(u => u.email === email);
            
            if (!user) {
                return res.redirect('/forgotpassword.html?error=No user found with this email');
                            }

            // Add the user to change.txt with the new verification code
            const userLine = `${user.user}:${user.email}:${user.password}:${user.p1}:${user.p2}:${verificationCode}\n`;

            // Append to change.txt
            changeUsers.push(userLine);  // Add the updated user information to the list

            fs.writeFile('change.txt', changeUsers.join('\n'), (err) => {
                if (err) {
                    return res.status(500).send('Error saving user data to change.txt');
                }

                // Send the OTP email
                sendVerificationEmail(email, verificationCode)
                    .then(() => {
                        res.redirect('/password'); // Redirect to password update page
                    })
                    .catch((error) => {
                        return res.redirect('/forgotpassword.html?error=Error sending verification email');
                          });
            });
        });
    });
});

// Serve the password page for the user to input the OTP and new password
app.get('/password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'password.html'));
});

// Handle updating the password after OTP verification
app.post('/update-password', (req, res) => {
    const { verificationCode, newPassword } = req.body;

    // Read change.txt to find the corresponding user by verification code
    fs.readFile('change.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading change.txt');
        }

        const users = data.split('\n').filter(Boolean).map(line => {
            const [user, email, password, p1, p2, code] = line.split(':');
            return { user, email, password, p1, p2, code };
        });

        const userIndex = users.findIndex(user => user.code === verificationCode);

        if (userIndex === -1) {
            return res.redirect('/password.html?error=Invalid verification email');
            }

        const user = users[userIndex];

        // Update the user's password
        user.password = newPassword;

        // Remove the user from the change.txt
        users.splice(userIndex, 1);

        // Write back the updated data to change.txt
        const updatedData = users.map(u => `${u.user}:${u.email}:${u.password}:${u.p1}:${u.p2}:${u.code}`).join('\n');

        fs.writeFile('change.txt', updatedData, (err) => {
            if (err) {
                return res.status(500).send('Error updating change.txt');
            }

            // Now, update the password in users.txt
            const updatedUserLine = `${user.user}:${user.email}:${newPassword}:${user.p1}:${user.p2}\n`;

            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                if (err) {
                    return res.status(500).send('Error reading users.txt');
                }

                const allUsers = data.split('\n').filter(Boolean);
                const updatedUsers = allUsers.map(line => {
                    const [username, email, password, p1, p2] = line.split(':');
                    return username === user.user ? updatedUserLine : line;
                });

                fs.writeFile(DATA_FILE, updatedUsers.join('\n'), (err) => {
                    if (err) {
                        return res.status(500).send('Error updating users.txt');
                    }

                    return res.redirect('/login');
            });
            });
        });
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


// Redirect request for /style.css to /public/style.css
app.get('/style.css', (req, res) => {
  res.redirect('/public/style.css');
});
