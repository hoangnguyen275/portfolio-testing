import rocketIcon from "./assets/rocket-icon.ico";
import laptopIcon from "./assets/laptop-icon.svg";
import checkIcon from "./assets/check-icon.svg";
import bookIcon from "./assets/closed-book.svg";
import jsIcon from "./assets/icons/JS.svg";
import cssIcon from "./assets/icons/css.svg";
import githubIcon from "./assets/icons/github.svg";
import htmlIcon from "./assets/icons/html.svg";
import javaIcon from "./assets/icons/java.svg";
import nextjsIcon from "./assets/icons/nextjs.svg";
import nodejsIcon from "./assets/icons/node-js.svg";
import sqlIcon from "./assets/icons/postgresql.svg";
import reactIcon from "./assets/icons/react.svg";
import pythonIcon from "./assets/icons/python.svg";
import projectImage from "./assets/project.jpg";
import project2Image from "./assets/project2.png";
import resume from "./assets/Resume_HoangNguyen.pdf";
import "./App.css";
import "./responsive.css";
import "./animation.css";

function App() {
  return (
    <>
    <title>Hoang Nguyen's Portfolio</title>
    <link rel="icon" type="image/svg+xml" href={rocketIcon} />

    {/* Header */}
    <header>
      <div className="container header__container">
        {/* Left column */}
        <div className="header__column--left">
          {/* Avatar */}
          <div className="header__img"></div>

          <div className="header__content--left">
            <h2 className="header__title">Hoang Nguyen</h2>
            <div className="header__badge_container">
              {/* leave some skills tags */}
              <div className="badge">Almost Fullstack Developer</div>
            </div>
            <p>
              My dream is want to be a <span>Junior Developer</span>
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="header__column--right">
          <h2 className="header__title">Contact Information</h2>
          <div className="email-display">
            <div>
              Email: <span>nguyenvhoang1004@gmail.com</span> or
            </div>{" "}
            <span>hnguyen275@student.gsu.edu</span>
          </div>
          <p>
            Phone Number: <span>7705893686</span>
          </p>
        </div>
      </div>
    </header>

    {/* About Me - Introduce myself */}
    <section className="aboutMe__section">
      {/* Motion pictures */}
      <img src={rocketIcon} alt="rocket icon" />

      <img src={laptopIcon} alt="laptop icon" />

      {/* Main Section */}
      <div className="aboutMe__container">
        <div className="aboutMe__content_container">
          <h1 className="section__title">Introduce Myself</h1>

          <p className="section__description">
            Hi! My name is Hoang Viet Nguyen, and I'm currently a Computer
            Science student at Georgia State University. I'm passionate about
            programming, algorithms, web development, and software development.
            I especially enjoy building practical projects and creating
            solutions that can be applied to real-world problems.
          </p>

          <div className="CTA">
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="primaryButton"
              download
            >
              Download Resume
            </a>

            <a href="#ProjectContainer" className="outlineButton">
              View Projects
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* SKills */}
    <section className="skills__section">
      <div className="container skills__container">
        {/* header */}
        <div className="section__header">
          <h1 className="section__title">Skills</h1>

          <p className="section__description">
            With a strong passion for web and mobile development, I have built
            hands-on experience with modern technologies across both front-end
            and back-end development. I have worked with React to create
            responsive and interactive user interfaces, while using Node.js and
            Express to develop server-side applications and APIs. I also use
            Python to strengthen my understanding of algorithms and
            problem-solving, and I have experience with Java and Microsoft SQL
            Server for back-end development and database management.
          </p>
        </div>

        {/* grid */}
        <div className="skills__grid_container">
          {/* grid item 1 */}
          <div className="skills__grid_item"></div>

          {/* grid item 2 */}
          <div className="skills__grid_item">
            <div className="skills__grid_item_header">
              <div>
                <img src={checkIcon} alt="check-icon" />
                <h2>Tools & Technologies</h2>
              </div>
              <p>
                Having experience with modern web development tools and enjoy
                building responsive, user-friendly websites, and passionate
                about writing clean, well-structured code that is easy to
                understand, maintain, and improve over time.
              </p>
            </div>

            {/* Skills logos */}
            <div>
              {/* list 1 */}
              <div className="icons_list-wrapper">
                <div className="icons-list">
                  <div className="icon-badges">
                    <img src={jsIcon} alt="js-icon" />
                    <span>JS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={githubIcon} alt="github-icon" />
                    <span>GITHUB</span>
                  </div>
                  <div className="icon-badges">
                    <img src={cssIcon} alt="css-icon" />
                    <span>CSS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={javaIcon} alt="java-icon" />
                    <span>JAVA</span>
                  </div>
                  <div className="icon-badges">
                    <img src={htmlIcon} alt="html-icon" />
                    <span>HTML</span>
                  </div>
                  <div className="icon-badges">
                    <img src={nextjsIcon} alt="nextjs-icon" />
                    <span>NEXTJS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={sqlIcon} alt="sql-icon" />
                    <span>SQL</span>
                  </div>
                  <div className="icon-badges">
                    <img src={nodejsIcon} alt="nodejs-icon" />
                    <span>NODEJS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={pythonIcon} alt="python-icon" />
                    <span>PYTHON</span>
                  </div>
                  <div className="icon-badges">
                    <img src={reactIcon} alt="react-icon" />
                    <span>REACT</span>
                  </div>
                </div>

                <div className="icons-list">
                  <div className="icon-badges">
                    <img src={jsIcon} alt="js-icon" />
                    <span>JS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={githubIcon} alt="github-icon" />
                    <span>GITHUB</span>
                  </div>
                  <div className="icon-badges">
                    <img src={cssIcon} alt="css-icon" />
                    <span>CSS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={javaIcon} alt="java-icon" />
                    <span>JAVA</span>
                  </div>
                  <div className="icon-badges">
                    <img src={htmlIcon} alt="html-icon" />
                    <span>HTML</span>
                  </div>
                  <div className="icon-badges">
                    <img src={nextjsIcon} alt="nextjs-icon" />
                    <span>NEXTJS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={sqlIcon} alt="sql-icon" />
                    <span>SQL</span>
                  </div>
                  <div className="icon-badges">
                    <img src={nodejsIcon} alt="nodejs-icon" />
                    <span>NODEJS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={pythonIcon} alt="python-icon" />
                    <span>PYTHON</span>
                  </div>
                  <div className="icon-badges">
                    <img src={reactIcon} alt="react-icon" />
                    <span>REACT</span>
                  </div>
                </div>
              </div>

              {/* list 2 */}
              <div className="icons_list-wrapper">
                <div className="icons-list">
                  <div className="icon-badges">
                    <img src={jsIcon} alt="js-icon" />
                    <span>JS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={githubIcon} alt="github-icon" />
                    <span>GITHUB</span>
                  </div>
                  <div className="icon-badges">
                    <img src={cssIcon} alt="css-icon" />
                    <span>CSS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={javaIcon} alt="java-icon" />
                    <span>JAVA</span>
                  </div>
                  <div className="icon-badges">
                    <img src={htmlIcon} alt="html-icon" />
                    <span>HTML</span>
                  </div>
                  <div className="icon-badges">
                    <img src={nextjsIcon} alt="nextjs-icon" />
                    <span>NEXTJS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={sqlIcon} alt="sql-icon" />
                    <span>SQL</span>
                  </div>
                  <div className="icon-badges">
                    <img src={nodejsIcon} alt="nodejs-icon" />
                    <span>NODEJS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={pythonIcon} alt="python-icon" />
                    <span>PYTHON</span>
                  </div>
                  <div className="icon-badges">
                    <img src={reactIcon} alt="react-icon" />
                    <span>REACT</span>
                  </div>
                </div>

                <div className="icons-list">
                  <div className="icon-badges">
                    <img src={jsIcon} alt="js-icon" />
                    <span>JS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={githubIcon} alt="github-icon" />
                    <span>GITHUB</span>
                  </div>
                  <div className="icon-badges">
                    <img src={cssIcon} alt="css-icon" />
                    <span>CSS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={javaIcon} alt="java-icon" />
                    <span>JAVA</span>
                  </div>
                  <div className="icon-badges">
                    <img src={htmlIcon} alt="html-icon" />
                    <span>HTML</span>
                  </div>
                  <div className="icon-badges">
                    <img src={nextjsIcon} alt="nextjs-icon" />
                    <span>NEXTJS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={sqlIcon} alt="sql-icon" />
                    <span>SQL</span>
                  </div>
                  <div className="icon-badges">
                    <img src={nodejsIcon} alt="nodejs-icon" />
                    <span>NODEJS</span>
                  </div>
                  <div className="icon-badges">
                    <img src={pythonIcon} alt="python-icon" />
                    <span>PYTHON</span>
                  </div>
                  <div className="icon-badges">
                    <img src={reactIcon} alt="react-icon" />
                    <span>REACT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* grid item 3 */}
          <div className="skills__grid_item">
            <div className="skills__grid_item_header">
              <div>
                <img src={checkIcon} alt="check-icon" />
                <h2>Soft Skills</h2>
              </div>
              <p>
                Strong communication, collaboration, teamwork, problem-solving,
                adaptability, continuous learning, and openness to new
                challenges.
              </p>
            </div>

            <div className="softSkills__container">
              <div className="softSkills_badge">
                <p>Communicate</p>
              </div>

              <div className="softSkills_badge">
                <p>Curiosity</p>
              </div>

              <div className="softSkills_badge">
                <p>Well-organized</p>
              </div>

              <div className="softSkills_badge">
                <p>Trustworthy</p>
              </div>

              <div className="softSkills__book_icons">
                <img src={bookIcon} alt="closed book icon" />
                <img src={bookIcon} alt="closed book icon" />
                <img src={bookIcon} alt="closed book icon" />
                <img src={bookIcon} alt="closed book icon" />
              </div>
            </div>
          </div>

          {/* grid item 4 */}
          <div className="skills__grid_item"></div>
        </div>
      </div>
    </section>

    {/* Projects */}
    <section className="projects__section" id="ProjectContainer">
      <div className="container projects_container">
        {/* header */}
        <div className="section__header">
          <h1 className="section__title">Projects</h1>
          <p className="section__description">
            These projects were completed while learning and applying new
            technologies, helping me strengthen my coding abilities, logical
            thinking, problem-solving skills, and attention to design and
            styling.
          </p>
        </div>

        {/* cards */}
        <div className="projects__cards_container">
          <a href="https://ecommerce-app.hoangnguyendev.com" target="_blank" rel="noopener noreferrer">
            <div className="projects_cards">
              <div className="projects__cards_wrapper">
                <img
                  src={projectImage}
                  alt="project-image"
                  className="projects__cards_img"
                />
              </div>
              <div className="projects__cards_titles">
                <h4>1st Project</h4>
                <h3>Ecommerce App</h3>
              </div>
            </div>
          </a>

          <a href="https://realtime-testing.vercel.app/" target="_blank" rel="noopener noreferrer">
            <div className="projects_cards">
              <div className="projects__cards_wrapper">
                <img
                  src={project2Image}
                  alt="project-image"
                  className="projects__cards_img"
                />
              </div>
              <div className="projects__cards_titles">
                <h4>2nd Project</h4>
                <h3>Real-Time Chat App</h3>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer>
      <div className="container">
        <p>© Hoang Nguyen's Portfolio</p>
      </div>
    </footer>
  </>
  );
}

export default App;
