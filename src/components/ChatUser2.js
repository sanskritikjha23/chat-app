import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './ChatUser2.css';

const ChatUser2 = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messageEndRef = useRef(null);
  const storage = getStorage();

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const typingRefUser1 = doc(db, 'typing', 'user1');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messagesData);
    });

    const unsubscribeTypingUser1 = onSnapshot(typingRefUser1, (doc) => {
      if (doc.exists()) {
        setIsTyping(doc.data().isTyping);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTypingUser1();
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (userMessage.trim() === '' && !selectedFile) return;

    let attachmentUrl = '';

    // Handle file upload if there's a selected file
    if (selectedFile) {
      const storageRef = ref(storage, `attachments/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      attachmentUrl = await getDownloadURL(storageRef);
      setSelectedFile(null); // Reset the selected file after upload
      setFilePreview(null); // Reset the file preview
    }

    await addDoc(collection(db, 'messages'), {
      text: userMessage,
      senderId: 'user2',
      receiverId: 'user1',
      timestamp: new Date(),
      attachmentUrl: attachmentUrl,
    });

    setUserMessage('');
    await setDoc(doc(db, 'typing', 'user2'), { isTyping: false });
  };

  const handleTyping = async () => {
    setIsTyping(true);
    await setDoc(doc(db, 'typing', 'user2'), { isTyping: true });
    setTimeout(() => {
      setIsTyping(false);
      setDoc(doc(db, 'typing', 'user2'), { isTyping: false });
    }, 2000);
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file)); // Set file preview
    }
  };

  const filteredMessages = messages.filter(message => 
    message.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      <h2>User 2</h2>
      <input
        type="text"
        placeholder="Search messages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
     <div className="messages2">
  {filteredMessages.map((message) => (
    <div key={message.id} className={`message ${message.senderId === 'user2' ? 'user1' : 'user2'}`}>
      {message.text}
      {message.attachmentUrl && (
        <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer">
          <img src={message.attachmentUrl} alt="Attachment" style={{ maxWidth: '100px', maxHeight: '100px' }} />
        </a>
      )}
    </div>
  ))}
  {isTyping && <div className="typing-indicator">User 1 is typing...</div>}
  <div ref={messageEndRef} />
</div>

      <form onSubmit={handleSendMessage} className="message-form">
        <div className="input-container">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => {
              setUserMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
          />
          <input 
            type="file" 
            accept="image/*,video/*,audio/*" 
            onChange={handleAttachmentChange}
            style={{ display: 'none' }} 
            id="file-input"
          />
          <label htmlFor="file-input" className="attachment-icon">📎</label>
          {filePreview && (
            <div className="file-preview">
              <img src={filePreview} alt="Preview" style={{ maxWidth: '50px', maxHeight: '50px' }} />
              <button type="button" className="remove-file-button" onClick={() => { setFilePreview(null); setSelectedFile(null); }}>
                ❌
              </button>
            </div>
          )}
          <span className="send-icon" onClick={handleSendMessage}>➤</span>
        </div>
      </form>
    </div>
  );
};

export default ChatUser2;
