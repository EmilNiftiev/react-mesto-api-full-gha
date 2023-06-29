class Api {
  constructor(options) {
    this._serverUrl = options.serverUrl;
    this._headers = options.headers;
  }

  _getResponseData(res) {
    if (!res.ok) {
      return Promise.reject(`Что-то пошло не так, ошибка: ${res.status}`);
    }
    return res.json();
  }

  setToken(token) {
    this._headers.Authorization = `Bearer ${token}`;
  }

  getInitialCards() {
    return fetch(this._serverUrl + "/cards", {
      method: "GET",
      headers: this._headers,
    }).then(this._getResponseData);
  }

  getUserInfo() {
    return fetch(this._serverUrl + "/users/me", {
      method: "GET",
      headers: this._headers,
    }).then(this._getResponseData);
  }

  getInitialData() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }

  // Отправка информации о пользователе

  setUserInfo({ name, about }) {
    return fetch(`${this._serverUrl}/users/me`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({
        name,
        about,
      }),
    }).then(this._getResponseData);
  }

  // Создание карточки

  createNewCard({ name, link }) {
    return fetch(`${this._serverUrl}/cards`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({
        name,
        link,
      }),
    }).then(this._getResponseData);
  }

  // Удаление карточки

  deleteCard(id) {
    return fetch(`${this._serverUrl}/cards/${id}`, {
      method: "DELETE",
      headers: this._headers,
    }).then(this._getResponseData);
  }

  // Поставить/убрать лайк

  changeLikeCardStatus(id, isLiked) {
    if (isLiked) {
      return fetch(`${this._serverUrl}/cards/${id}/likes`, {
        method: "PUT",
        headers: this._headers,
      }).then(this._getResponseData);
    } else {
      return fetch(`${this._serverUrl}/cards/${id}/likes`, {
        method: "DELETE",
        headers: this._headers,
      }).then(this._getResponseData);
    }
  }

  // Изменить аватар

  updateAvatar({ avatar }) {
    return fetch(`${this._serverUrl}/users/me/avatar`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({
        avatar,
      }),
    }).then(this._getResponseData);
  }
}

const api = new Api({
  serverUrl: "http://127.0.0.1:3000",
  // serverUrl: "https://api.emilniftiev.nomoreparties.sbs",
  headers: {
    Authorization: "",
    "Content-Type": "application/json",
  },
});

export default api;
