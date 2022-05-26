document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('onsubmit', load_mailbox('sent'));
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      emails.forEach(function(email) {
        const element = document.createElement('div', );
        element.classList.add('border', 'p-2', 'row')
        
        if (mailbox === 'inbox') {
          element.innerHTML = `<div class='col-3'>From: ${email['sender']} </div> <div class='col-6 '> Subject: ${email['subject']}</div> <div class='col-3 text-end'>${email['timestamp']} </div>`;
          if (email['read'] === true){
            element.classList.add('bg-secondary');
          }
        } else if (mailbox === 'sent'){
          element.innerHTML = `<div class='col-3'>To: ${email['recipients']} </div> <div class='col-6 '> Subject: ${email['subject']}</div> <div class='col-3 text-end'>${email['timestamp']} </div>`;
          if (email['read'] === false){
            element.classList.add('bg-secondary');
          }
        } else if (mailbox === 'archive'){
          element.innerHTML = `<div class='col-3'>From: ${email['sender']} </div> <div class='col-6 '> Subject: ${email['subject']}</div> <div class='col-3 text-end'>${email['timestamp']} </div>`;
        }
        element.addEventListener('click', function() {
            console.log('This element has been clicked!')
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'none';
            document.querySelector('#email-view').style.display = 'block'; 
            fetch(`/emails/${email['id']}`)
            .then(response => response.json())
            .then(email => {
                // Print emails
                console.log(email);
                let archived = 'archive'
                if (email['archived'] === false){
                  archived = 'Archive'
                } else {
                  archived = 'Unarchive'
                }
                document.querySelector('#email-view').classList.add('border', 'container', 'p-3');
                document.querySelector('#email-view').innerHTML = (`
                  <div class='row'>From: ${email['sender']}</div> 
                  <div class='row'>To: ${email['recipients']}</div> 
                  <div class='row'> Subject: ${email['subject']}</div>
                  <div class='row text-end'>Sent at: ${email['timestamp']}</div>
                  <div class='row text-end border mt-2'>${email['body']}</div>
                  <div class='row justify-content-end'>
                  <div class="col-9"></div>
                  <div class="col-auto">
                  <button type="button" class="btn btn-dark m-2" id="email-${email['id']}">${archived}</button>
                  <button type="button" class="btn btn-dark m-2" id="reply-${email['id']}">Reply</button>
                  </div>
                  </div>
                `);
                fetch(`/emails/${email['id']}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      'read': true
                  })
                })
                document.getElementById(`email-${email['id']}`).addEventListener("click", function() {
                  if (email['archived'] === false){
                    fetch(`/emails/${email['id']}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                          'archived': true
                      })
                    })
                    load_mailbox('inbox')
                    return
                  } else{
                    fetch(`/emails/${email['id']}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                          'archived': false
                      })
                    });
                    load_mailbox('inbox')
                    return
                  }
                  
              }, false);
              document.getElementById(`reply-${email['id']}`).addEventListener('click', function() {
                document.querySelector('#emails-view').style.display = 'none';
                document.querySelector('#email-view').style.display = 'none';
                document.querySelector('#compose-view').style.display = 'block';

                // Clear out composition fields
                document.querySelector('#compose-recipients').value = `${email['sender']}`;
                document.querySelector('#compose-subject').value = `Re: ${email['subject']}`;
                document.querySelector('#compose-body').value = `On ${email['timestamp']} ${email['sender']} wrote: "${email['body']}" \n`;
              });
            });


        });
        document.querySelector('#emails-view').append(element);
      });
  });
}

function send_email(){
  const recepients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recepients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  return
  
}

