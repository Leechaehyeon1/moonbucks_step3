import { $ } from './utils/dom.js';
import { store } from './store/index.js';
// import { MenuApi } from './api/index.js';

const BASE_URL = 'http://localhost:3000/api';

const MenuApi = {
  async getAllMenuByCategory(category){
    const response = await fetch(
      `${BASE_URL}/category/${category}/menu`
    )
    return response.json();
  },
  async createMenu(category, name){
    const response = await fetch(
      `${BASE_URL}/category/${category}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    if(!response.ok){
      alert('에러가 발생했습니다.');
      console.error('에러가 발생했습니다.');
    }
  },
  async toggleSoldOutMenu(category, menuId){
    const response = await fetch(
      `${BASE_URL}/category/${category}/menu/${menuId}/soldout`,
      {
        method: 'PUT',
      }
    );
    if(!response.ok){
      alert('에러가 발생했습니다.');
      console.error('에러가 발생했습니다.');
    }
  },
  async updateMenuList(category, name, menuId){
    const response = await fetch(
      `${BASE_URL}/category/${category}/menu/${menuId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    if(!response.ok){
      alert('에러가 발생했습니다.');
      console.error('에러가 발생했습니다.');
    }
    return response.json();
  },
  async removeMenu(category, menuId){
    const response = await fetch(
      `${BASE_URL}/category/${category}/menu/${menuId}`,
      {
        method: 'DELETE'
    });
    if(!response.ok){
      alert('에러가 발생했습니다.');
      console.error('에러가 발생했습니다.');
    }
  }
};

function App(){
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };
  this.currentCategory = 'espresso';
  this.init = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
      );
    render();
    initEventListeners();
  }

  const render = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    const template = this.menu[this.currentCategory].map((menuItem) => {
      return `
      <li data-menu-id="${menuItem.id}" class="menu-list-item d-flex items-center py-2">
        <span class="w-100 pl-2 menu-name ${menuItem.isSoldOut ? 'sold-out' : ''}">${menuItem.name}</span>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
        >
          품절
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
        >
          수정
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
        >
          삭제
        </button>
      </li>`
    })
    .join('');
  
    $('#menu-list').innerHTML = template;
    updatedMenuListCount();
  }

  const updatedMenuListCount = () => {
    const menuCount = this.menu[this.currentCategory].length;
    $('.menu-count').innerText = `총 ${menuCount}개`;
  }

  const addMenuList = async () => {
    if($('#menu-name').value === ''){
      alert('값을 입력해주세요.');
      return;
    }

    const duplicateItem = this.menu[this.currentCategory].find(
      (menuItem) => menuItem.name === $('#menu-name').value
    );
    if(duplicateItem){
      alert('이미 등록된 메뉴입니다. 다시 입력해주세요');
      $('#menu-name').value = '';
      return;
    }

    const menuName = $('#menu-name').value;
    await MenuApi.createMenu(this.currentCategory, menuName);
    render();
  };

  const updatedMenuList = async (e) => {
    const menuId = e.target.closest('li').dataset.menuId;
    const $menuName = e.target.closest('li').querySelector('.menu-name');
    const newMenuName = prompt(
      '수정할 메뉴명을 입력하세요.',
      $menuName.innerText
      );
      if(newMenuName !== null){
        await MenuApi.updateMenuList(this.currentCategory, newMenuName, menuId);
        render();
      }
  }

  const removeMenuName = async (e) => {
    if(confirm('정말 삭제하시겠습니까?')){
      const menuId = e.target.closest('li').dataset.menuId;
      await MenuApi.removeMenu(this.currentCategory, menuId);
      render();
    }
  }

  const soldOutMenu = async (e) => {
    const menuId = e.target.closest('li').dataset.menuId;
    await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);
    render();
  }

  const changeCategory = (e) => {
    const isCategoryButton = e.target.classList.contains('cafe-category-name');
    if(isCategoryButton){
      const categoryName = e.target.dataset.categoryName;
      this.currentCategory = categoryName;
      $('#category-title').innerText = `${e.target.innerText} 메뉴 관리`;
      render();
    }
  }

  const initEventListeners = () => {
    $('#menu-list').addEventListener('click', (e) => {
      if(e.target.classList.contains('menu-edit-button')){
        updatedMenuList(e);
        return;
      }
  
      if(e.target.classList.contains('menu-remove-button')){
        removeMenuName(e);
        return;
      }
  
      if(e.target.classList.contains('menu-sold-out-button')){
        soldOutMenu(e);
        return;
      }
    });
  
    $('#menu-form').addEventListener('submit', (e) => {
      e.preventDefault();
    });
  
    $('#menu-submit-button').addEventListener('click', addMenuList);
  
    $('#menu-name').addEventListener('keydown', (e) => {
      if(e.key !== 'Enter'){
        return;
      }
      addMenuList();
    });
  
    $('nav').addEventListener('click', changeCategory);
  }
}

const app = new App();
app.init();