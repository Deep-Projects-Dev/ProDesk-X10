// imports
import { useState } from "react";
import "./ncert.css";

// function
export default function NCERT() {
  const subjects = [
    {
      id: 1,
      name: "Hindi",
      books: [
        {
          id: 1,
          title: "क्षितिज",
          description: "हिंदी पाठ पुस्तक कक्षा 10",
          chapters: [
            { id: 1, title: "Soordas", files: [{ type: "PDF", name: "Soordas PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=1-12" }] },
            { id: 2, title: "Tulsidas", files: [{ type: "PDF", name: "Tulsidas PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=2-12" }] },
            { id: 3, title: "Jayshankar Prasad", files: [{ type: "PDF", name: "Jayshankar Prasad PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=3-12" }] },
            { id: 4, title: "Suryakant Tripathi 'Nirala'", files: [{ type: "PDF", name: "Suryakant Tripathi 'Nirala' PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=4-12" }] },
            { id: 5, title: "Nagarjun", files: [{ type: "PDF", name: "Nagarjun PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=5-12" }] },
            { id: 6, title: "Manglesh Dabraal", files: [{ type: "PDF", name: "Manglesh Dabraal PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=6-12" }] },
            { id: 7, title: "Swaym Prakash", files: [{ type: "PDF", name: "Swaym Prakash PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=7-12" }] },
            { id: 8, title: "Ramvriksha Benipuri", files: [{ type: "PDF", name: "Ramvriksha Benipuri PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=8-12" }] },
            { id: 9, title: "Yashpal", files: [{ type: "PDF", name: "Yashpal PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=9-12" }] },
            { id: 10, title: "Mannu Bhandari", files: [{ type: "PDF", name: "Mannu Bhandari PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=10-12" }] },
            { id: 11, title: "Yatindra Mishr", files: [{ type: "PDF", name: "Yatindra Mishr PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=11-12" }] },
            { id: 12, title: "Bhadant Anand Kausalyayan", files: [{ type: "PDF", name: "Bhadant Anand Kausalyayan PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhks1=12-12" }] },
          ],
        },
        {
          id: 2,
          title: "कृतिका",
          description: "विकल्प पुस्तक कक्षा 10 हिंदी",
          chapters: [
            { id: 1, title: "Mata Ka Anchal", files: [{ type: "PDF", name: "Mata Ka Anchal PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhkr1=1-3" }] },
            { id: 2, title: "Sana-Sana Haath Jodi", files: [{ type: "PDF", name: "Sana-Sana Haath Jodi PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhkr1=2-3" }] },
            { id: 3, title: "Main Kyon Likhta hoon?", files: [{ type: "PDF", name: "Main Kyon Likhta hoon? PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhkr1=3-3" }] },
            { id: 4, title: "Lekhak Parichaya", files: [{ type: "PDF", name: "Lekhak Parichaya PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jhkr1=lp-3" }] },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "English",
      books: [
        {
          id: 1,
          title: "First Flight",
          description: "Course Reader for Class 10 English",
          chapters: [
            { id: 1, title: "A Letter to God | Dust of Snow | Fire and Ice", files: [{ type: "PDF", name: "A Letter to God PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=1-9" }] },
            { id: 2, title: "Nelson Mandela | A Tiger in the Zoo", files: [{ type: "PDF", name: "Nelson Mandela PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=2-9" }] },
            { id: 3, title: "Two Stories About Flying | How to Tell Wild Animals", files: [{ type: "PDF", name: "Two Stories About Flying PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=3-9" }] },
            { id: 4, title: "From the Diary of Anne Frank | Amanda!", files: [{ type: "PDF", name: "From the Diary of Anne Frank PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=4-9" }] },
            { id: 5, title: "Glimpses of India | The Trees", files: [{ type: "PDF", name: "Glimpses of India PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=5-9" }] },
            { id: 6, title: "Mijbil the Otter | The Fog", files: [{ type: "PDF", name: "Mijbil the Otter PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=6-9" }] },
            { id: 7, title: "Madam Rides the Bus | The Tale of Custard the Dragon", files: [{ type: "PDF", name: "Madam Rides the Bus PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=7-9" }] },
            { id: 8, title: "The Sermon at Benares | For Anne Gregory", files: [{ type: "PDF", name: "The Sermon at Benares PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=8-9" }] },
            { id: 9, title: "The Proposal", files: [{ type: "PDF", name: "The Proposal PDF", downloadUrl: "https://ncert.nic.in/textbook.php?jeff1=9-9" }] },
          ],
        },
        {
          id: 2,
          title: "Footprints Without Feet",
          description: "Supplementary Reader for Class 10 English",
          chapters: [
            { id: 1, title: "A Triumph of Surgery", files: [{ type: "PDF", name: "A Triumph of Surgery PDF" }] },
            { id: 2, title: "The Thief's Story", files: [{ type: "PDF", name: "The Thief's Story PDF" }] },
            { id: 3, title: "The Midnight Visitor", files: [{ type: "PDF", name: "The Midnight Visitor PDF" }] },
            { id: 4, title: "A Question of Trust", files: [{ type: "PDF", name: "A Question of Trust PDF" }] },
            { id: 5, title: "Footprints Without Feet", files: [{ type: "PDF", name: "Footprints Without Feet PDF" }] },
            { id: 6, title: "The Making of a Scientist", files: [{ type: "PDF", name: "The Making of a Scientist PDF" }] },
            { id: 7, title: "The Necklace", files: [{ type: "PDF", name: "The Necklace PDF" }] },
            { id: 8, title: "Bholi", files: [{ type: "PDF", name: "Bholi PDF" }] },
            { id: 9, title: "The Book That Saved the Earth", files: [{ type: "PDF", name: "The Book That Saved the Earth PDF" }] },
            { id: 10, title: "The Adventures of Toto", files: [{ type: "PDF", name: "The Adventures of Toto PDF" }] },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Mathematics",
      books: [
        {
          id: 1,
          title: "Mathematics",
          description: "Course Reader for Class 10 Mathematics",
          chapters: [
            { id: 1, title: "Real Numbers", files: [{ type: "PDF", name: "Real Numbers PDF" }] },
            { id: 2, title: "Polynomials", files: [{ type: "PDF", name: "Polynomials PDF" }] },
            { id: 3, title: "Pair of Linear Equations in Two Variables", files: [{ type: "PDF", name: "Pair of Linear Equations PDF" }] },
            { id: 4, title: "Quadratic Equations", files: [{ type: "PDF", name: "Quadratic Equations PDF" }] },
            { id: 5, title: "Arithmetic Progressions", files: [{ type: "PDF", name: "Arithmetic Progressions PDF" }] },
            { id: 6, title: "Triangles", files: [{ type: "PDF", name: "Triangles PDF" }] },
            { id: 7, title: "Coordinate Geometry", files: [{ type: "PDF", name: "Coordinate Geometry PDF" }] },
            { id: 8, title: "Introduction to Trigonometry", files: [{ type: "PDF", name: "Introduction to Trigonometry PDF" }] },
            { id: 9, title: "Some Applications of Trigonometry", files: [{ type: "PDF", name: "Some Applications of Trigonometry PDF" }] },
            { id: 10, title: "Circles", files: [{ type: "PDF", name: "Circles PDF" }] },
            { id: 11, title: "Constructions", files: [{ type: "PDF", name: "Constructions PDF" }] },
            { id: 12, title: "Areas Related to Circles", files: [{ type: "PDF", name: "Areas Related to Circles PDF" }] },
            { id: 13, title: "Surface Areas and Volumes", files: [{ type: "PDF", name: "Surface Areas and Volumes PDF" }] },
            { id: 14, title: "Statistics", files: [{ type: "PDF", name: "Statistics PDF" }] },
            { id: 15, title: "Probability", files: [{ type: "PDF", name: "Probability PDF" }] },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Science",
      books: [
        {
          id: 1,
          title: "Science",
          description: "Course Reader for Class 10 Science",
          chapters: [
            { id: 1, title: "Chemical Reactions and Equations", files: [{ type: "PDF", name: "Chemical Reactions PDF" }] },
            { id: 2, title: "Acids, Bases and Salts", files: [{ type: "PDF", name: "Acids Bases and Salts PDF" }] },
            { id: 3, title: "Metals and Non-metals", files: [{ type: "PDF", name: "Metals and Non-metals PDF" }] },
            { id: 4, title: "Carbon and its Compounds", files: [{ type: "PDF", name: "Carbon and its Compounds PDF" }] },
            { id: 5, title: "Periodic Classification of Elements", files: [{ type: "PDF", name: "Periodic Classification PDF" }] },
            { id: 6, title: "Life Processes", files: [{ type: "PDF", name: "Life Processes PDF" }] },
            { id: 7, title: "Control and Coordination", files: [{ type: "PDF", name: "Control and Coordination PDF" }] },
            { id: 8, title: "How do Organisms Reproduce?", files: [{ type: "PDF", name: "How do Organisms Reproduce PDF" }] },
            { id: 9, title: "Heredity and Evolution", files: [{ type: "PDF", name: "Heredity and Evolution PDF" }] },
            { id: 10, title: "Light – Reflection and Refraction", files: [{ type: "PDF", name: "Light Reflection and Refraction PDF" }] },
            { id: 11, title: "Human Eye and Colourful World", files: [{ type: "PDF", name: "Human Eye and Colourful World PDF" }] },
            { id: 12, title: "Electricity", files: [{ type: "PDF", name: "Electricity PDF" }] },
            { id: 13, title: "Magnetic Effects of Electric Current", files: [{ type: "PDF", name: "Magnetic Effects of Electric Current PDF" }] },
            { id: 14, title: "Sources of Energy", files: [{ type: "PDF", name: "Sources of Energy PDF" }] },
            { id: 15, title: "Our Environment", files: [{ type: "PDF", name: "Our Environment PDF" }] },
            { id: 16, title: "Sustainable Management of Natural Resources", files: [{ type: "PDF", name: "Sustainable Management PDF" }] },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Social Science",
      books: [
        {
          id: 1,
          title: "India and the Contemporary World-II",
          description: "History for Class 10",
          chapters: [
            { id: 1, title: "The Rise of Nationalism in Europe", files: [{ type: "PDF", name: "Nationalism in Europe PDF" }] },
            { id: 2, title: "The Nationalist Movement in Indo-China", files: [{ type: "PDF", name: "Indo-China PDF" }] },
            { id: 3, title: "Nationalism in India", files: [{ type: "PDF", name: "Nationalism in India PDF" }] },
            { id: 4, title: "The Making of a Global World", files: [{ type: "PDF", name: "Global World PDF" }] },
            { id: 5, title: "The Age of Industrialisation", files: [{ type: "PDF", name: "Industrialisation PDF" }] },
          ],
        },
        {
          id: 2,
          title: "Contemporary India-II",
          description: "Geography for Class 10",
          chapters: [
            { id: 1, title: "Resources and Development", files: [{ type: "PDF", name: "Resources PDF" }] },
            { id: 2, title: "Forest and Wildlife Resources", files: [{ type: "PDF", name: "Forest Resources PDF" }] },
            { id: 3, title: "Water Resources", files: [{ type: "PDF", name: "Water Resources PDF" }] },
            { id: 4, title: "Mineral and Energy Resources", files: [{ type: "PDF", name: "Mineral Resources PDF" }] },
            { id: 5, title: "Manufacturing Industries", files: [{ type: "PDF", name: "Industries PDF" }] },
          ],
        },
        {
          id: 3,
          title: "Democratic Politics-II",
          description: "Political Science for Class 10",
          chapters: [
            { id: 1, title: "Power Sharing", files: [{ type: "PDF", name: "Power Sharing PDF" }] },
            { id: 2, title: "Federalism", files: [{ type: "PDF", name: "Federalism PDF" }] },
            { id: 3, title: "Gender, Religion and Caste", files: [{ type: "PDF", name: "Gender Religion Caste PDF" }] },
            { id: 4, title: "Popular Struggles and Movements", files: [{ type: "PDF", name: "Popular Struggles PDF" }] },
            { id: 5, title: "Political Parties", files: [{ type: "PDF", name: "Political Parties PDF" }] },
          ],
        },
        {
          id: 4,
          title: "Understanding Economic Development",
          description: "Economics for Class 10",
          chapters: [
            { id: 1, title: "Development", files: [{ type: "PDF", name: "Development PDF" }] },
            { id: 2, title: "Sectors of the Indian Economy", files: [{ type: "PDF", name: "Sectors PDF" }] },
            { id: 3, title: "Money and Credit", files: [{ type: "PDF", name: "Money and Credit PDF" }] },
            { id: 4, title: "Globalisation and the Indian Economy", files: [{ type: "PDF", name: "Globalisation PDF" }] },
            { id: 5, title: "Consumer Rights", files: [{ type: "PDF", name: "Consumer Rights PDF" }] },
          ],
        },
      ],
    },
    {
      id: 6,
      name: "Artificial Intelligence",
      books: [
        {
          id: 1,
          title: "Artificial Intelligence and Python",
          description: "Course Reader for Class 10 AI",
          chapters: [
            { id: 1, title: "What is Artificial Intelligence?", files: [{ type: "PDF", name: "AI Introduction PDF" }] },
            { id: 2, title: "Python Basics", files: [{ type: "PDF", name: "Python Basics PDF" }] },
            { id: 3, title: "Decision Trees", files: [{ type: "PDF", name: "Decision Trees PDF" }] },
            { id: 4, title: "Neural Networks", files: [{ type: "PDF", name: "Neural Networks PDF" }] },
            { id: 5, title: "AI Ethics", files: [{ type: "PDF", name: "AI Ethics PDF" }] },
          ],
        },
      ],
    },
    {
      id: 7,
      name: "Sanskrit",
      books: [
        {
          id: 1,
          title: "संस्कृत सृजनम्",
          description: "कक्षा 10 संस्कृत पाठ पुस्तक",
          chapters: [
            { id: 1, title: "अहं श्रोत्र", files: [{ type: "PDF", name: "अहं श्रोत्र PDF" }] },
            { id: 2, title: "बालकः", files: [{ type: "PDF", name: "बालकः PDF" }] },
            { id: 3, title: "मित्रम्", files: [{ type: "PDF", name: "मित्रम् PDF" }] },
            { id: 4, title: "कृष्णस्य संघर्षः", files: [{ type: "PDF", name: "कृष्णस्य संघर्षः PDF" }] },
            { id: 5, title: "धर्मं रक्षति रक्षितः", files: [{ type: "PDF", name: "धर्मं रक्षति रक्षितः PDF" }] },
            { id: 6, title: "जीवनम्", files: [{ type: "PDF", name: "जीवनम् PDF" }] },
          ],
        },
      ],
    },
    {
      id: 8,
      name: "Information Technology",
      books: [
        {
          id: 1,
          title: "Information Technology",
          description: "Course Reader for Class 10 IT",
          chapters: [
            { id: 1, title: "Computer Fundamentals", files: [{ type: "PDF", name: "Computer Fundamentals PDF" }] },
            { id: 2, title: "Word Processing", files: [{ type: "PDF", name: "Word Processing PDF" }] },
            { id: 3, title: "Spreadsheet", files: [{ type: "PDF", name: "Spreadsheet PDF" }] },
            { id: 4, title: "Presentations", files: [{ type: "PDF", name: "Presentation PDF" }] },
            { id: 5, title: "Internet and Cyber Safety", files: [{ type: "PDF", name: "Cyber Safety PDF" }] },
          ],
        },
      ],
    },
    {
      id: 9,
      name: "Agriculture",
      books: [
        {
          id: 1,
          title: "Introductory Agriculture",
          description: "Course Reader for Class 10 Agriculture",
          chapters: [
            { id: 1, title: "Introduction to Agriculture", files: [{ type: "PDF", name: "Introduction PDF" }] },
            { id: 2, title: "Soil and Water Management", files: [{ type: "PDF", name: "Soil and Water PDF" }] },
            { id: 3, title: "Crop Production", files: [{ type: "PDF", name: "Crop Production PDF" }] },
            { id: 4, title: "Animal Husbandry", files: [{ type: "PDF", name: "Animal Husbandry PDF" }] },
            { id: 5, title: "Agricultural Practices", files: [{ type: "PDF", name: "Agricultural Practices PDF" }] },
          ],
        },
      ],
    },
  ];

  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [selectedBook, setSelectedBook] = useState(subjects[0]?.books[0]);

  const handleDownload = (file, book) => {
    const url = file.downloadUrl || book?.downloadUrl || selectedBook?.chapters[0]?.files[0]?.downloadUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("Download is not available for this item. Please provide a valid link or local asset.");
    }
  };

  return (
    <div id="NCERT">
      <aside id="optPanel">
        <h1>NCERT X</h1>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            className={`option ${selectedSubject?.id === subject.id ? "active" : ""}`}
            onClick={() => {
              setSelectedSubject(subject);
              setSelectedBook(subject.books[0]);
            }}
          >
            {subject.name}
          </button>
        ))}
      </aside>

      <main id="books">
        <div id="bookList">
          {selectedSubject?.books.map((book) => (
            <button
              key={book.id}
              className={`bookName ${selectedBook?.id === book.id ? "active" : ""}`}
              onClick={() => setSelectedBook(book)}
            >
              <div className="title">{book.title}</div>
              <div className="desc">{book.description}</div>
            </button>
          ))}
        </div>

        <div className="content">
          {selectedBook?.chapters.map((chapter) => (
            <div key={chapter.id} className="chapterTile">
              <h3>{chapter.title}</h3>
              <div className="files">
                {chapter.files.map((file, index) => (
                  <button
                    key={index}
                    className="fileBtn"
                    onClick={() => handleDownload(file, selectedBook)}
                  >
                    {file.type}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
