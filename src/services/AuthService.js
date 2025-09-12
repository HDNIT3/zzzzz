export async function loginRequest(username, password) {
  const res = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const token = await res.text(); 
  return token;
}

export async function registerRequest(userData) {
  // userData = { username, password, fullName, email, phoneNumber, role }
  const res = await fetch("http://localhost:8080/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json(); 
}

