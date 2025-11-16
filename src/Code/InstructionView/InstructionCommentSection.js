import React, { useState, useEffect } from 'react';
import { useInstructions } from '../../Context/InstructionsContext';
import CommentOptionsMenu from './CommentOptionsMenu';
import { Modal, Button, Form } from 'react-bootstrap';

const InstructionCommentSection = () => {
  const {
    currentStepData,
    addComment,
    isCurrentStep,
  } = useInstructions();

  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    setComment('');
    setShowComments(false);
    setShowCommentsModal(false);
    setShowAddCommentModal(false);
  }, [currentStepData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddComment = () => {
    if (comment.trim()) {
      addComment({ text: comment });
      setComment('');
      if (isMobileOrTablet) {
        setShowAddCommentModal(false);
      }
    }
  };

  const handleCancelComment = () => {
    setComment('');
    if (isMobileOrTablet) {
      setShowAddCommentModal(false);
    }
  };

  const toggleShowComments = () => {
    if (isMobileOrTablet) {
      setShowCommentsModal(!showCommentsModal);
    } else {
      setShowComments(!showComments);
    }
  };

  const openAddCommentModal = () => {
    setShowAddCommentModal(true);
  };

  const hasComments = Array.isArray(currentStepData?.comments) && currentStepData.comments.length > 0;

  return (
    <div className="w-100 h-100 d-flex align-items-center">
      {isMobileOrTablet ? (
        <CommentOptionsMenu
          onShowComments={toggleShowComments}
          onAddComment={openAddCommentModal}
          hasComments={hasComments}
        />
      ) : (
        <div className="d-flex align-items-center w-100 gap-2">
          {/* Show Comments Button */}
          {hasComments && !showComments && (
            <div>
              <button
                className="btn btn-light btn-sm text-dark border"
                onClick={toggleShowComments}
                style={{ width: 'auto' }}
              >
                Show Comments
              </button>
            </div>
          )}

          {/* Scrollable comments */}
          {showComments && hasComments && (
            <div
              className="bg-light border rounded p-2 ms-2 text-dark"
              style={{
                maxHeight: '70px',
                overflowY: 'auto',
                width: '90%',
                fontSize: '0.75rem',
                position: 'relative'
              }}
            >
              {currentStepData.comments.map((cmt, index) => {
                const createdAt = new Date(cmt.created_at).toLocaleTimeString();
                return (
                  <div key={index} className="mb-1">
                    <strong>{cmt.user || 'Unknown User'}</strong>: {cmt.text}
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      ({createdAt})
                    </div>
                  </div>
                );
              })}

              <span
                className="position-absolute"
                style={{
                  right: '10px',
                  top: '10px',
                  cursor: 'pointer',
                  color: 'red',
                  fontSize: '1.2rem'
                }}
                onClick={toggleShowComments}
              >
                &times;
              </span>
            </div>
          )}

          {/* Textarea to add comment */}
          {isCurrentStep && !showComments && (
            <div className="d-flex align-items-center position-relative" style={{ width: '600px' }}>
              <textarea
                className="form-control me-2"
                style={{
                  height: '40px',
                  resize: 'none',
                  paddingRight: comment ? '5.5rem' : '0.75rem',
                }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />

              {comment && (
                <div className="d-flex position-absolute end-0 me-2" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                  <span
                    style={{
                      cursor: 'pointer',
                      color: 'red',
                      fontSize: '1.2rem',
                      marginRight: '0.5rem'
                    }}
                    onClick={handleCancelComment}
                  >
                    &times;
                  </span>
                  <button className="btn btn-success btn-sm" onClick={handleAddComment}>
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Modal show={showCommentsModal} onHide={() => setShowCommentsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {hasComments ? (
            currentStepData.comments.map((cmt, index) => {
              const createdAt = new Date(cmt.created_at).toLocaleTimeString();
              return (
                <div key={index} className="mb-2">
                  <strong>{cmt.user || 'Unknown User'}</strong>: {cmt.text}
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    ({createdAt})
                  </div>
                </div>
              );
            })
          ) : (
            <p>No comments for this step.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCommentsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddCommentModal} onHide={() => setShowAddCommentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your comment here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelComment}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddComment}>
            Add Comment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InstructionCommentSection;