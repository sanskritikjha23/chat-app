import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './ChatUser1.css';

const ChatUser1 = () => {
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
    const typingRef = doc(db, 'typing', 'user2');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messagesData);
    });

    const unsubscribeTyping = onSnapshot(typingRef, (doc) => {
      if (doc.exists()) {
        setIsTyping(doc.data().isTyping);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (userMessage.trim() === '' && !selectedFile) return;

    let attachmentUrl = '';

    if (selectedFile) {
      const storageRef = ref(storage, `attachments/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      attachmentUrl = await getDownloadURL(storageRef);
      setSelectedFile(null);
      setFilePreview(null);
    }

    await addDoc(collection(db, 'messages'), {
      text: userMessage,
      senderId: 'user1',
      receiverId: 'user2',
      timestamp: new Date(),
      attachmentUrl: attachmentUrl,
    });

    setUserMessage('');
    await setDoc(doc(db, 'typing', 'user1'), { isTyping: false });
  };

  const handleTyping = async () => {
    setIsTyping(true);
    await setDoc(doc(db, 'typing', 'user1'), { isTyping: true });
    setTimeout(() => {
      setIsTyping(false);
      setDoc(doc(db, 'typing', 'user1'), { isTyping: false });
    }, 2000);
  };

  const handleDeleteMessage = async (id) => {
    await deleteDoc(doc(db, 'messages', id));
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const filteredMessages = messages.filter(message => 
    message.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      <h2>User 1</h2>
      <input
        type="text"
        placeholder="Search messages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="messages">
        {filteredMessages.map((message) => (
          <div key={message.id} className={`message ${message.senderId === 'user1' ? 'user1' : 'user2'}`}>
            {message.text}
            {message.attachmentUrl && (
              <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer">
                <img src={message.attachmentUrl} alt="Attachment" style={{ maxWidth: '100px', maxHeight: '100px' }} />
              </a>
            )}
            {message.senderId === 'user1' && (
              <button className="delete-button" onClick={() => handleDeleteMessage(message.id)}>🗑️</button>
            )}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">User 2 is typing...</div>}
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

export default ChatUser1;
