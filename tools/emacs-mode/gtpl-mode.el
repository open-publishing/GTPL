(defgroup gtpl-faces nil
  "Customizing gtpl-mode custom faces"
  :group 'faces)


(defface gtpl-markup-face
  '((t
	   (:foreground "PaleGreen"  t)))
	"Face to use for GTPL markup."
	  :group 'gtpl-faces)

(defface gtpl-brackets-face
  '((t
	   (:foreground "Green")))
	"Face to use for GTPL markup."
	  :group 'gtpl-faces)

(defface gtpl-closer-face
  '((t
	   (:inherit 'gtpl-brackets-face)))
	"Face to use for GTPL markup."
	  :group 'gtpl-faces)

(defface gtpl-keyword-face
  '((t
	   (:inherit 'font-lock-keyword-face)))
	"Face to use for GTPL markup."
	  :group 'gtpl-faces)

(font-lock-add-keywords 'gtpl-mode 
						'(("{\\(/?\\)\\(\\([^{]\\|{\\([^{]\\|{\\([^{]\\|{[^{}]*?}\\)*?}\\)*?}\\)*?\\)}" 
						   (0 'gtpl-brackets-face t) 
						   (1 'gtpl-closer-face t) 
						   (2 'gtpl-markup-face t)
						   )
						  ("{/?\\(template\\|ifempty\\|if\\|elseif\\|else\\|foreach|\\|break\\|continue\\|call\\|Call\\|yield\\|Yield\\|param\\|container\\|meta\\|cycle\\|namespace\\|ldelim\\|rdelim\\|literal\\)\\(\\([^{]\\|{\\([^{]\\|{\\([^{]\\|{[^{}]*?}\\)*?}\\)*?}\\)*?\\)}" 
						   (1 'gtpl-keyword-face t)
						   )
						  ("{\\*.*?\\*}" 0 'font-lock-comment-face t)))


(defun gtpl-indent-line ()
  "Indent the current line as SGML, then GTPL."
  (interactive)
  (sgml-indent-line)
  (let* ((savep (point))
	 (indent-col
	  (save-excursion
	    (back-to-indentation)
	    (if (>= (point) savep) (setq savep nil))
	    (gtpl-calculate-indent))))
    (if (null indent-col)
	'noindent
      (if savep
	  (save-excursion (indent-line-to indent-col))
	(indent-line-to indent-col)))))

(defun gtpl-calculate-indent ()
  "Calculates indentation column"
  (back-to-indentation)
  (let* (
		 (case-fold-search nil)
		 (savecol (current-column))
		 (newcol
		  (cond 
		   ((looking-at "{/?\\(template\\|namespace\\)") 0)
		   ((looking-at "{/") (- (gtpl-indent-look-back) sgml-basic-offset))
		   ((looking-at "{\\(else\\|elseif\\|ifempty\\)") (- (gtpl-indent-look-back) sgml-basic-offset))
		   ((looking-at "</") (if (gtpl-indent-look-back-is-html) savecol (- (gtpl-indent-look-back) sgml-basic-offset)))
		   (t (gtpl-indent-look-back)))))
	(max 0 newcol)))

(defun gtpl-indent-look-back-is-html ()
  (save-excursion
	(if (zerop (forward-line -1))
		  ;; Go back to previous non-empty line.
		  (progn 
			(while (and (looking-at "[ \t]*$") (zerop (forward-line -1))))
			(back-to-indentation)
			(looking-at "[^{]")))))

(defun gtpl-indent-look-back ()
  (save-excursion
	(let ((savecol (current-column)))
	  (if (zerop (forward-line -1))
		  ;; Go back to previous non-empty line.
		  (progn 
			(while (and (looking-at "[ \t]*$") (zerop (forward-line -1))))
			(back-to-indentation)
			(cond
			 ((looking-at "{\\(template\\|ifempty\\|if\\|elseif\\|else\\|foreach\\|literal\\|Call\\|Yield\\)" )
			  (let	((tagname (concat "{/" (match-string 1)))
					 (currcol (current-column)))
				(if (search-forward tagname (line-end-position) t)
					currcol
					(+ currcol sgml-basic-offset))
				))
			 ((looking-at "{/\\(template\\|if\\|foreach\\|literal\\|Call\\|Yield\\)" )
			  (current-column))
			 ((looking-at "{" )
			  (current-column))
			 ((looking-at "<" )
			  savecol)
			 (t (current-column))))
		savecol))))

(define-derived-mode gtpl-mode html-mode "GTPL"
  (set (make-local-variable 'indent-line-function) 'gtpl-indent-line))

(provide 'gtpl-mode)