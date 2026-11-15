package com.civicflow.repository;

import com.civicflow.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicationId(Long applicationId);
    List<Document> findByApplicationIdAndDocumentType(Long applicationId, Document.DocumentType documentType);
}

