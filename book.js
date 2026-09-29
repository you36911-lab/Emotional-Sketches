/* ═══════════════════════════════════════════
   책 넘기기
   ═══════════════════════════════════════════ */

// true  = 창 크기가 바뀌면 책도 같이 커지고 작아짐
// false = 모니터 화면 크기 기준으로 한 번만 맞춤 (창을 줄이면 스크롤)
const FIT_TO_WINDOW = true;

const book = document.getElementById('book');
const scaler = document.querySelector('.scaler');
const leaves = Array.from(document.querySelectorAll('.leaf'));
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const indicator = document.getElementById('indicator');

const PAGE_W = 760;
const PAGE_H = 950;
const TOTAL_SPREADS = leaves.length + 1;   // 펼친 면 개수

let current = 0;   // 지금 펼쳐진 면 (= 넘긴 종이 수)

/* ── 종이 겹침 순서 ── */
function restingZ(i, flipped) {
    // 안 넘긴 종이: 앞쪽 종이가 위 / 넘긴 종이: 나중에 넘긴 종이가 위
    return flipped ? i + 1 : leaves.length - i + 1;
}

// 평면(rest) 상태를 애니메이션 없이 3D 상태로 되돌림
function wake(leaf) {
    if (!leaf.classList.contains('rest')) return;
    leaf.style.transition = 'none';
    leaf.classList.remove('rest');
    void leaf.offsetWidth;          // 브라우저에 바뀐 상태를 먼저 적용시킴
    leaf.style.transition = '';
}

function turn(i, flip) {
    const leaf = leaves[i];
    wake(leaf);
    leaf.classList.add('turning');
    leaf.style.zIndex = 100 + i;        // 넘어가는 동안은 맨 위로
    leaf.classList.toggle('flipped', flip);
}

leaves.forEach((leaf, i) => {
    leaf.style.zIndex = restingZ(i, false);
    leaf.classList.add('rest');

    leaf.addEventListener('transitionend', (e) => {
        if (e.target !== leaf || e.propertyName !== 'transform') return;
        leaf.classList.remove('turning');
        leaf.style.zIndex = restingZ(i, leaf.classList.contains('flipped'));
        leaf.classList.add('rest');
    });

    // 오른쪽 페이지 클릭 = 다음, 왼쪽 페이지 클릭 = 이전
    leaf.addEventListener('click', () => {
        if (leaf.classList.contains('flipped')) prev();
        else next();
    });
});

function next() {
    if (current >= leaves.length) return;
    turn(current, true);
    current++;
    update();
}

function prev() {
    if (current <= 0) return;
    current--;
    turn(current, false);
    update();
}

// 목차에서 특정 면으로 바로 이동 (한 장씩 차르르 넘어감)
function goTo(target) {
    target = Math.max(0, Math.min(leaves.length, target));
    const step = target > current ? next : prev;
    const count = Math.abs(target - current);
    for (let k = 0; k < count; k++) {
        setTimeout(step, k * 140);
    }
}

function update() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === leaves.length;

    const left = current * 2;           // 왼쪽 페이지 번호 (0 = 표지)
    const right = left + 1;
    const label = (n) => (n === 0 ? 'Cover' : n > leaves.length * 2 ? 'End' : n);
    indicator.textContent = `${label(left)} — ${label(right)}`;
}

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
});

document.querySelectorAll('[data-go]').forEach((link) => {
    link.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(Number(link.dataset.go));
    });
});

/* ── 화면에 맞게 책 크기 조절 ── */
function fit(width, height) {
    const s = Math.min((width - 48) / (PAGE_W * 2), (height - 110) / PAGE_H);
    scaler.style.setProperty('--s', Math.max(0.3, s).toFixed(4));
}

if (FIT_TO_WINDOW) {
    fit(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', () => fit(window.innerWidth, window.innerHeight));
} else {
    fit(screen.availWidth, screen.availHeight - 120);
}

update();
