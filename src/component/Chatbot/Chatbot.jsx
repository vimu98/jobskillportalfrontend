import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Fab,
  Zoom,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Slide,
  Fade,
  Box,
  Button,
  Chip,
  Typography,
  useTheme,
  Divider
} from '@mui/material';
import { Chat as ChatIcon, Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const Chatbot = ({ job }) => {
  const theme = useTheme();
  const [showChatbot, setShowChatbot] = useState(true);
  const [messages, setMessages] = useState([
    {
      text: `Hello! I can answer questions about the ${job?.title || 'this'} position.`,
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectIntent = async (text) => {
    if (!job?.id) {
      setError("Job information is missing.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:8080/api/dialogflow/query', {
        message: text,
        sessionId: `job-${job.id}-${Math.random().toString(36).substr(2, 9)}`,
        parameters: {
          jobId: String(job.id),
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.response;
    } catch (error) {
      console.error('Dialogflow error:', error);
      setError("Sorry, I'm having trouble connecting to the assistant.");
      return "I couldn't process your request. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const botResponse = await detectIntent(input);
    setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  const suggestedQuestions = [
    'What is the salary for this position?',
    'What skills are required?',
    'Where is this job located?',
    'How do I apply?',
    'What are the job requirements?',
    'What is the interview process?',
    'Am I eligible for this role?'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {showChatbot ? (
        <Slide direction="up" in mountOnEnter unmountOnExit>
          <Card sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: 380,
            maxWidth: '90vw',
            maxHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            zIndex: theme.zIndex.modal,
            boxShadow: theme.shadows[10]
          }}>
            <CardHeader
              action={
                <IconButton onClick={toggleChatbot}>
                  <CloseIcon />
                </IconButton>
              }
              title="Job Assistant"
              sx={{
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                '& .MuiCardHeader-subheader': {
                  color: theme.palette.primary.contrastText,
                  opacity: 0.8
                }
              }}
            />
            <Divider />
            <CardContent sx={{
              flex: 1,
              overflow: 'auto',
              p: 0,
              bgcolor: theme.palette.background.default
            }}>
              <List sx={{ p: 2 }}>
                {messages.map((msg, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      px: 1,
                      py: 1.5
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 32 }}>
                      <Avatar sx={{
                        width: 28,
                        height: 28,
                        bgcolor: msg.sender === 'user' 
                          ? theme.palette.secondary.main 
                          : theme.palette.grey[500]
                      }}>
                        {msg.sender === 'user' ? 'Y' : 'A'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        mx: 1,
                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                        '& .MuiListItemText-primary': {
                          bgcolor: msg.sender === 'user'
                            ? theme.palette.secondary.light
                            : theme.palette.grey[200],
                          color: msg.sender === 'user'
                            ? theme.palette.secondary.contrastText
                            : theme.palette.text.primary,
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          display: 'inline-block',
                          maxWidth: '80%',
                          wordBreak: 'break-word'
                        }
                      }}
                      primaryTypographyProps={{ component: 'div' }}
                      primary={msg.text}
                    />
                  </ListItem>
                ))}
                {isLoading && (
                  <ListItem sx={{ justifyContent: 'flex-start', px: 1, py: 1.5 }}>
                    <ListItemAvatar sx={{ minWidth: 32 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.grey[500] }}>
                        A
                      </Avatar>
                    </ListItemAvatar>
                    <CircularProgress size={20} sx={{ mx: 2 }} />
                  </ListItem>
                )}
                <div ref={messagesEndRef} />
              </List>
            </CardContent>
            <Fade in={error !== null}>
              <Box sx={{
                bgcolor: theme.palette.error.light,
                color: theme.palette.error.contrastText,
                p: 1,
                textAlign: 'center'
              }}>
                <Typography variant="caption">{error}</Typography>
              </Box>
            </Fade>
            <Box sx={{ p: 1, bgcolor: theme.palette.grey[100] }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {suggestedQuestions.map((question, i) => (
                  <Chip
                    key={i}
                    label={question}
                    onClick={() => setInput(question)}
                    disabled={isLoading}
                    size="small"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: theme.palette.grey[300]
                      }
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about the job..."
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      bgcolor: theme.palette.background.paper
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  sx={{
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%'
                  }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
          </Card>
        </Slide>
      ) : (
        <Zoom in={!showChatbot}>
          <Fab
            color="primary"
            aria-label="chat"
            onClick={toggleChatbot}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 999
            }}
          >
            <ChatIcon />
          </Fab>
        </Zoom>
      )}
    </>
  );
};

Chatbot.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    company: PropTypes.string,
    salary: PropTypes.string,
    location: PropTypes.string,
    skillsRequired: PropTypes.string,
    experienceRequired: PropTypes.string,
    employmentType: PropTypes.string
  })
};

export default Chatbot;