import React from 'react'
import { Button, Modal } from 'react-bootstrap'

const DeleteConfrimModal = ({confirmDelete,handleModal,isDeleting,blogToDelete}) => {
    
  return (
    <div>
         <Modal 
         show={true} onHide={() => !isDeleting && handleModal()}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {blogToDelete?.title}? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => handleModal()}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default DeleteConfrimModal