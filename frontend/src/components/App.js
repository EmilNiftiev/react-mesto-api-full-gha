import { React, useState, useEffect } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import api from "../utils/Api";
import {
  CurrentUserContext,
  defaultUser,
} from "../contexts/CurrentUserContext";

import Login from "./Login";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";
import * as apiAuth from "../utils/ApiAuth";

function App() {
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState(defaultUser);
  const [cards, setCards] = useState([]);

  const [isInfoTooltipPopup, setIsInfoTooltipPopup] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function openInfoTooltipPopup(isSignIn) {
    setIsInfoTooltipPopup(true);
    setIsSignIn(isSignIn);
  }

  // Закрытие попапов

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setSelectedCard(null);
    setIsInfoTooltipPopup(false);
  }

  // Закрытие по Escape

  const isOpen =
    isEditAvatarPopupOpen ||
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    selectedCard;

  useEffect(() => {
    function closeByEscape(evt) {
      if (evt.key === "Escape") {
        closeAllPopups();
      }
    }
    if (isOpen) {
      // навешиваем только при открытии
      document.addEventListener("keydown", closeByEscape);
      return () => {
        // потом удаляем слушатель
        document.removeEventListener("keydown", closeByEscape);
      };
    }
  }, [isOpen]);

  // Функция для блоков catch, чтобы избавиться от дублирования кода

  const handleError = (err) => {
    console.log(err);
    openInfoTooltipPopup(false);
  };

  useEffect(() => {
    if (loggedIn) {
      Promise.all([api.getUserInfo(), api.getInitialCards()])
        .then(([data, cards]) => {
          setCurrentUser({ ...currentUser, ...data });
          setCards(cards);
        })
        .catch(handleError);
    }
  }, [loggedIn]);

  // useEffect(() => {
  //   api
  //     .getInitialCards()
  //     .then((cards) => {
  //       setCards(cards);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       openInfoTooltipPopup(false);
  //     });
  // }, [loggedIn]);

  // useEffect(() => {
  //   api
  //     .getUserInfo()
  //     .then((data) => {
  //       setCurrentUser({ ...currentUser, data });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       openInfoTooltipPopup(false);
  //     });
  // }, [loggedIn]);

  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    // Отправляем запрос в API и получаем обновлённые данные карточки
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch(handleError);
  }

  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((cards) => cards.filter((item) => item._id !== card._id));
      })
      .then(() => closeAllPopups())
      .catch(handleError);
  }

  function handleUpdateUser(data) {
    api
      .setUserInfo(data)
      .then((serverData) => {
        setCurrentUser({ ...currentUser, ...serverData });
        closeAllPopups();
      })
      .catch(handleError);
  }

  function handleUpdateAvatar(data) {
    api
      .updateAvatar(data)
      .then((serverData) => {
        setCurrentUser({ ...currentUser, ...serverData });
        closeAllPopups();
      })
      .catch(handleError);
  }

  function handleAddCard(card) {
    api
      .createNewCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch(handleError);
  }

  // Регистрация

  function handleRegister(data) {
    apiAuth
      .register(data)
      .then((res) => {
        if (res && res.data) {
          openInfoTooltipPopup(true);
          navigate("/sign-in");
        }
      })
      .catch(handleError);
  }

  // Проверить токен

  function checkToken() {
    const token = localStorage.getItem("jwt");
    if (token) {
      apiAuth
        .checkToken(token)
        .then((res) => {
          if (res && res.data) {
            setLoggedIn(true);
            setCurrentUser({ ...currentUser, email: res.data.email });
            navigate("/");
          }
        })
        .catch(handleError);
    }
  }
  useEffect(() => {
    checkToken();
  }, []);

  // Вход в профиль

  function handleLogin(data) {
    apiAuth
      .login(data)
      .then((res) => {
        if (res && res.token) {
          setCurrentUser({ ...currentUser, email: data.email });
          localStorage.setItem("jwt", res.token);
          checkToken();
        }
      })
      .catch(handleError);
  }

  // Выход из профиля

  function logOut() {
    setLoggedIn(false);
    setCurrentUser(defaultUser);
    localStorage.removeItem("jwt");
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="body">
        <div className="page">
          <Header
            loggedIn={loggedIn}
            email={currentUser.email}
            logOut={logOut}
          />

          <Routes>
            <Route
              path="/sign-up"
              element={<Register onRegister={handleRegister} />}
            />
            <Route path="/sign-in" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/"
              element={
                <ProtectedRoute
                  loggedIn={loggedIn}
                  element={Main}
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  onEditAvatar={handleEditAvatarClick}
                  onCardClick={handleCardClick}
                  onCardLike={handleCardLike}
                  onCardDelete={handleCardDelete}
                  cards={cards}
                />
              }
            />
            <Route
              path="*"
              element={<Navigate to={loggedIn ? "/" : "/sign-in"} />}
            />
          </Routes>

          {/* ---------------------------- Редактирование профиля ---------------------------- */}

          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />

          {/* ---------------------------- Добавление карточки ---------------------------- */}

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddCard}
          />

          {/* ---------------------------- Обновление аватара ---------------------------- */}

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />

          {/* ---------------------------- Подтверждение удаления ---------------------------- */}

          <PopupWithForm
            name="delete-confirm"
            title="Вы уверены?"
            onClose={closeAllPopups}
            buttonText="Да"
          />

          {/* ---------------------------- Увеличение карточки ---------------------------- */}

          <ImagePopup card={selectedCard} onClose={closeAllPopups} />

          <InfoTooltip
            name="tooltip"
            isOpen={isInfoTooltipPopup}
            onClose={closeAllPopups}
            isSignIn={isSignIn}
          />

          {loggedIn && <Footer />}
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
