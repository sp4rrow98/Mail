document.addEventListener("DOMContentLoaded", function () {
	// Use buttons to toggle between views
	document
		.querySelector("#inbox")
		.addEventListener("click", () => load_mailbox("inbox"));
	document
		.querySelector("#sent")
		.addEventListener("click", () => load_mailbox("sent"));
	document
		.querySelector("#archived")
		.addEventListener("click", () => load_mailbox("archive"));
	document.querySelector("#compose").addEventListener("click", compose_email);
	document
		.querySelector("#compose-form")
		.addEventListener("submit", send_email);
	
	// By default, load the inbox
	load_mailbox("inbox");
});

function compose_email() {
	// Show compose view and hide other views
	document.querySelector("#email").innerHTML = ``;
	document.querySelector("#email").style.display = "none";
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#compose-view").style.display = "block";
	document.querySelector("#message").style.display = "none";

	// Clear out composition fields
	document.querySelector("#compose-recipients").value = "";
	document.querySelector("#compose-subject").value = "";
	document.querySelector("#compose-body").value = "";
}

function send_email(event) {
	event.preventDefault();

	// Get the inputs
	const recipients = document.querySelector("#compose-recipients").value;
	const subject = document.querySelector("#compose-subject").value;
	const body = document.querySelector("#compose-body").value;

	// Send the e-mail
	fetch("/emails", {
		method: "POST",
		body: JSON.stringify({
			recipients: recipients,
			subject: subject,
			body: body,
		}),
	})
		.then((response) => response.json())
		.then((result) => {
			// Print result
			// console.log(result);
		});
	
	document.querySelector("#message").style.display = "block";
	alert = document.querySelector("#message")
	alert.setAttribute("class", "alert alert-success text-center");
	alert.innerHTML = `Message was sent!`;

	// Clear out composition fields
	document.querySelector("#compose-recipients").value = "";
	document.querySelector("#compose-subject").value = "";
	document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	
	document.querySelector("#email").innerHTML = ``;
	document.querySelector("#email").style.display = "none";
	document.querySelector("#emails-view").style.display = "block";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#message").style.display = "none";
	// Show the mailbox name
	document.querySelector("#emails-view").innerHTML = `
	<h3>${
		mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
	}</h3>
	`;

	fetch("/emails/" + mailbox)
		.then((response) => response.json())
		.then((emails) => {
			// Print emails
			console.log(emails);

			// ... do something else with emails ...
			if (mailbox == "sent") {
				emails.forEach((email) => {
					let div = document.createElement("div");
					div.setAttribute("class", "container anim");
					div.innerHTML = `
					<div class="row selected my-3 border border-secondary ">
						<div class="col">${email.recipients}</div>
						<div class="col text-center">${email.subject}</div>
						<div class="col text-right">${email.timestamp}</div>		
					</div>
					`;
					div.addEventListener("click", () => load_email(email.id));
					document.querySelector("#emails-view").append(div);
				});
			}

			// INBOX MAILS
			else {
				// Current user
				let user = document.querySelector("#user").textContent;
				emails.forEach((email) => {
					if (user !== email.sender){let div = document.createElement("div");
					div.setAttribute("class", "container");
					div.className = email['read'] ? "email-read container" : "email-unread container";
					div.innerHTML = `
					<div class="row my-3 selected border border-secondary">
						<div class="col sender">${email.sender}</div>			
						<div class="col text-center">${email.subject}</div>			
						<div class="col text-right">${email.timestamp}</div>
					</div>
					`;
					div.addEventListener("click", () => load_email(email.id));
					document.querySelector("#emails-view").append(div);
				}
				});
			}
		});
}

function load_email(id) {
	fetch('/emails/' + id, {
		method: 'PUT',
		body: JSON.stringify({
			read: true
		})
	  })

	fetch('/emails/' + id)
	.then(response => response.json())
	.then(email => {
		// Print email
		console.log(email);

	document.querySelector("#email").style.display = "block";
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#message").style.display = "none";

	// Current user
	let user = document.querySelector("#user").textContent;

	// MAIL
	let mail = document.createElement("div");
	mail.innerHTML = `<div class="row d-inline-block" style="width:16vh; font-weight:600;">
	Sender:
	</div> 
	<div class="d-inline-block" style="width:16vh;">
	${email.sender}
	</div>`
	document.querySelector("#email").append(mail);

	// SUBJECT
	let subject = document.createElement("div");
	subject.innerHTML = `<div class="row d-inline-block" style="width:16vh; font-weight:600;">
	Subject: 
	</div> 
	<div class="d-inline-block">
	${email.subject}
	</div>`
	document.querySelector("#email").append(subject);

	// TIMESTAMP
	let timestamp = document.createElement("div");
	timestamp.innerHTML = `<div class="row d-inline-block" style="width:16vh; font-weight:600;">
	Time:    
	</div> 
	<div class="d-inline-block">
	${email.timestamp}
	</div>`
	document.querySelector("#email").append(timestamp);

	// Body
	let body = document.createElement("div");
	body.innerHTML = `<div class="row message d-inline-block mt-3">
	<div class="d-inline-block" style="font-weight:600;">Message: </div>
	<div class="mt-1">${email.body}</div>
	</div>`
	document.querySelector("#email").append(body);

	// Buttons
	let button = document.createElement("button");
	let reply = document.createElement("reply")
	button.setAttribute("class", "btn btn-secondary mt-3 d-inline-block ml-4");
	button.innerHTML = !email.archived ? 'Archive' : 'Unarchive';
	reply.setAttribute("class", "row btn btn-primary mt-3");
	reply.innerHTML = `Reply`;
	reply.addEventListener("click", () => {
		compose_email();
		document.querySelector("#compose-recipients").value = email.sender;
		if(email.subject.includes("Re:")){
			document.querySelector("#compose-subject").value = email.subject;
		} else {
			document.querySelector("#compose-subject").value = "Re: " + email.subject;
		}
		document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: "${email.body}"`;
	})

	button.addEventListener("click", (ev) => {
		ev.preventDefault();
		if (email.archived === false) {
			fetch('/emails/' + id, {
				method: 'PUT',
				body: JSON.stringify({
					archived: true
				})
			  })
			.then(data => {
			console.log('Success:', data);
			load_mailbox("inbox");
			document.querySelector("#message").style.display = "block";
			alert = document.querySelector("#message")
			alert.setAttribute("class", "alert alert-danger text-center");
			alert.innerHTML = `Message was archived!`;
			})
			  
		} else {
			fetch('/emails/' + id, {
				method: 'PUT',
				body: JSON.stringify({
					archived: false
				})
			  })
			  .then(data => {
				load_mailbox("inbox");
				document.querySelector("#message").style.display = "block";
				alert = document.querySelector("#message")
				alert.setAttribute("class", "alert alert-success text-center");
				alert.innerHTML = `Message was unarchived!`;
			  })
			  
		}
	})
	
	if (user !== email.sender){
		document.querySelector("#email").append(reply);
	}
	if (user !== email.sender){
		document.querySelector("#email").append(button);
	}
});
}
