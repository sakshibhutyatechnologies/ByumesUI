// CommentOptionsMenu.js
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaEllipsisV } from 'react-icons/fa';

const CommentOptionsMenu = ({ onShowComments, onAddComment, hasComments }) => {
  return (
    <Dropdown drop="up"> {/* Add drop="up" to make the dropdown open upwards */}
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        <FaEllipsisV />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {hasComments && (
          <Dropdown.Item onClick={onShowComments}>Show Comments</Dropdown.Item>
        )}
        <Dropdown.Item onClick={onAddComment}>Add Comment</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CommentOptionsMenu;