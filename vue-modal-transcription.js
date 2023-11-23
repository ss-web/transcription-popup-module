const { ref, onMounted, defineProps, createApp, watch, computed } = Vue;

const App = createApp({});
const reqHeaders = {
	mode: "cors", // no-cors, *cors, same-origin
	cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
	credentials: "same-origin", // include, *same-origin, omit
}
const playRepeat = {
	template: `<svg  width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" >
	<path fill="#4297ED" d="M256.455 8c66.269.119 126.437 26.233 170.859 68.685l35.715-35.715C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.75c-30.864-28.899-70.801-44.907-113.23-45.273-92.398-.798-170.283 73.977-169.484 169.442C88.764 348.009 162.184 424 256 424c41.127 0 79.997-14.678 110.629-41.556 4.743-4.161 11.906-3.908 16.368.553l39.662 39.662c4.872 4.872 4.631 12.815-.482 17.433C378.202 479.813 319.926 504 256 504 119.034 504 8.001 392.967 8 256.002 7.999 119.193 119.646 7.755 256.455 8z"></path>
	</svg>`
}
const playSvg = {
	template: `<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M0 0V14L11.0526 7L0 0Z" fill="#4297ED"/>
	</svg>`
}
const pauseSvg = {
	template: `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
		width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
		preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
		fill="#4297ED" stroke="none">
			<path d="M774 5104 c-16 -8 -39 -29 -50 -47 -19 -31 -19 -71 -19 -2497 0
			-2429 0 -2465 20 -2497 38 -64 23 -63 660 -63 631 0 622 -1 662 58 17 26 18
			131 18 2502 0 2371 -1 2476 -18 2502 -40 59 -31 58 -664 58 -494 0 -582 -3
			-609 -16z"/>
			<path d="M3123 5104 c-18 -9 -40 -28 -50 -43 -17 -25 -18 -135 -18 -2501 0
			-2371 1 -2476 18 -2502 40 -59 31 -58 662 -58 637 0 622 -1 660 63 20 32 20
			68 20 2497 0 2429 0 2465 -20 2497 -38 64 -23 63 -662 63 -506 0 -582 -2 -610
			-16z"/>
		</g></svg>`
}

const transcriptionModal = {
	template: `
	<div @mouseup="isResizeTime = false">
		<div id="modalCupSubclips" ref="modalCupSubclips" class="v-popup-parent v-popup-fon v-center">
			<div class="v-popup-fon" @click="onCloseModal"></div>
			<div class="v-popup-t">
				<div class="v-popup-top-t">
					<button @click="onCloseModal">Close</button>
				</div>
				<div class="v-popup-content-t">
					<div class="v-popup-content-l-t">
						<div class="v-popup-context-t">
							<div class="v-popup-content-l-top-t">
								<div class="v-find-inp" :class="{'active':isSearchActive}">
									<input type="text" placeholder="Search" v-model="search" />
									<span><i>{{segmentsSearch.count?activeSearch:0}}</i>/<b>{{segmentsSearch.count}}</b></span>
								</div>
								<div class="v-find-inp-nav">
									<span :class="{'active':activeSearch > 1}" @click="onPrevFind">Prev</span>
									<span :class="{'active':activeSearch < segmentsSearch.count}" @click="onNextFind">Next</span>
								</div>
								<button class="v-center v-btn-def-t" @click="onAddSelected">Add Selected</button>
							</div>
							<div class="v-popup-content-text-list-l-t">
								<div id="blockForHighlight">
									<div
										v-for="(v, i) in segmentsNoEmpty" :key="i"
										class="v-popup-content-paragraf-t"
										:class="{'hide':onSearch(v.content)||onShowSkeaper(v.speakerId), ['speaker_'+onGetSpeakerKey(v.speakerId)]:true}">
										<p :id="v.id">
											<span
												v-for="(_v, _i) in v.arr"
												:key="i"
												:id="_v.id"
												:data-start="_v.start"
												:data-end="_v.end"
												class="v-popup-content-paragraf-t-i"
												:class="{'active':onIsActiveInclude(_v.id),'point':_v.type==='punctuation','out-video': onSubInVideo(_v)}"
											>
												{{_v.content}}
											</span>
										</p>
									</div>
								</div>
								<div class="v-popup-content-search"><div
									v-for="(v, i) in segmentsSearch.arr" :key="i"
									class="v-popup-content-paragraf-t"
									:class="{'hide':onSearch(v)||onShowSkeaper(v.speakerId), ['speaker_'+onGetSpeakerKey(v.speakerId)]:true}"
								><p v-html="v" /></div></div>
							</div>
						</div>
					</div>
					<div class="v-popup-content-r-t">
						<div class="v-popup-video v-center">
							<div class="v-popup-video-play" @click="onPlay">
								<v-play v-if="isPaused&&!isRepeat" /><v-pause v-if="!isPaused&&!isRepeat" /><v-repeat v-if="isPaused&&isRepeat" />
							</div>
							<video
								ref="videoNode"
								:src="videoLink"
								@loadeddata="loadedData"
								@timeupdate="timeUpdated" />
						</div>
						<div class="v-popup-time">
							<span>{{onTimeMs(currentTime)}}</span>
							<span v-if="activeFragment" class="v-popup-time-active">{{onTimeMs(activeFragment.in)}} - {{onTimeMs(activeFragment.out)}}</span>
						</div>
						<div ref="timeDiv" class="v-popup-timeline">
							<div
								class="v-popup-timeline--change"
								@touchstart.passive="onChangeCurentTime"
								@touchmove.passive="onChangeCurentTime"
								@touchend="isResizeTime = false"
								@mousedown="
									isResizeTime = true;
									onChangeCurentTime($event)
								"
								@mousemove="onChangeCurentTime"
							/>
							<div class="v-popup-timeline--active" :style="getWidthPosition({'in':0,'out':currentTime})" />
							<div
								v-for="(v,i) in ASCsortListExport" :key="i" :style="getWidthPosition(v)"
								:class="{'active':onIsActiveFragment(v), 'disabled':isResizeTime}"
								@click="setActiveFragment(v,i)"
							/>
							<div class="v-popup-timeline--top"
								@touchstart.passive="onChangeCurentTime"
								@touchmove.passive="onChangeCurentTime"
								@touchend="isResizeTime = false"
								@mousedown="
									isResizeTime = true;
									onChangeCurentTime($event)
								"
								@mousemove="onChangeCurentTime"
								:style="getWidthPosition({'in':currentTime,'out':currentTime})"
							/>
						</div>
						<div class="v-popup-context-t">
							<div v-else class="v-popup-context-l-t">
								<div class="v-popup-edit">
									<div
										v-for="(v,i) in ASCsortListExport"
										:key="i" :id="'exp_node_t'+i"
										:class="{'v-popup-edit-block-active':onIsActiveFragment(v), 'v-popup-edit-block':!onIsActiveFragment(v)}"
									>
										<div class="v-popup-edit-block-border--parent">
											<span v-if="v.context.length === 1" class="v-popup-edit-block-border" @click="setActiveFragment(v,i)">{{v.context[0]}}</span>
											<div v-else @click="setActiveFragment(v,i)">
												<div v-for="(s,k) in v.context" :key="k+'_segment'" class="v-popup-edit-block-border">{{s}}</div>
											</div>
											<span v-if="onIsActiveFragment(v)" class="v-popup-edit-context-time"><span>{{onTimeMs(v.in)}}</span>&nbsp;-&nbsp;<span>{{onTimeMs(v.out)}}</span></span>
										</div>
										<div class="v-popup-edit-block-right">
											<button :class="{'v-popup-edit-block-del-active':onIsActiveFragment(v), 'v-popup-edit-block-delete':!onIsActiveFragment(v)}" @click="onRequestDel(v.id)">Close</button>
											<button v-if="onIsActiveFragment(v)" class="v-popup-edit-play" @click="onStartVideoTime(v)"><v-play v-if="isPaused" /><v-pause v-else /></button>
										</div>
									</div>
									<p v-if="listSelected.length===0">Here will be selected text.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>`,
	setup(props, context) {
		const isRepeat = ref(false);
		const isResizeTime = ref(false);
		const isPaused = ref(true);
		const videoNode = ref(null);
		const maxLenghVideo = ref(null);
		const timeDiv = ref(null);
		const currentTime = ref(0);
		const activeSearch = ref(0);
		const counterLocal = ref(0);
		const search = ref('');
		const defSpeaker = { id: "all", name: "All" };
		const arrPunctuations = [';',',',':','.'];
		const activeFragment = ref(null);
		const modalCupSubclips = ref(null);
		const speakerActive = ref(defSpeaker);
		const segments = ref([]);
		const speakers = ref([defSpeaker]);
		const listSelected = ref([]);
		const searchInd = 'subclipSearchInd';
		const highlight = computed(() => window.getSelection());
		const isSearchActive = computed(() => search.value.length && segmentsSearch.value.count);
		const segmentsNoEmpty = computed(() => segments.value.filter(e => e.content.replace(/[\s.,%]/g, '')));
		const segmentsSearch = computed(() => {
			let count = 0;
			const maxMap = [];
			const arr = segmentsNoEmpty.value.map((e, i) => {
				if (!search.value) return `<b>${e.content}</b>`;
				const cap = search.value.charAt(0).toUpperCase() + search.value.slice(1);
				const low = search.value.toLocaleLowerCase();
				const str = `<b>${e.content.replaceAll(low,`</b><i>${low}</i><b>`).replaceAll(cap,`</b><i>${cap}</i><b>`)}</b>`;
				const locLen = (str.split('<i>').length-1);
				let uppStr = str;
				maxMap.push(locLen);
				const idNum = maxMap.reduce((a,b) => a+b);
				let n = locLen;
				while (n > -1) {
					n--;
					uppStr = uppStr.replace('<i>', `<i id="${searchInd}_${idNum - n}" class="${activeSearch.value===idNum-n?'active':''}">`);
				}
				count += locLen;
				return uppStr;
			});
			return {arr, count};
		});
		const segmentsNoSort = computed(() => segments.value.map(e => e.arr).flat(1).filter(e => e.content));
		const videoLink = ref('https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4');
		const txtCormater = (str) => str.trim().replace(/\s\s+/g, ' ');
		const onPrevFind = () => activeSearch.value>1 && activeSearch.value--;
		const onNextFind = () => activeSearch.value<segmentsSearch.value.count && activeSearch.value++;
		const onDeselect = () => {
			window.getSelection().removeAllRanges();
		}
		const onTimeMs = (time) => {
			var sec_num = parseInt(time, 10); // don't forget the second param
			var hours   = Math.floor(sec_num / 3600);
			var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			var seconds = sec_num - (hours * 3600) - (minutes * 60);
			if (hours   < 10) {hours   = "0"+hours;}
			if (minutes < 10) {minutes = "0"+minutes;}
			if (seconds < 10) {seconds = "0"+seconds;}
			return hours+':'+minutes+':'+seconds;
		};
		const getAllIncludes = (val, arr = segmentsNoSort.value) => arr.filter((e) => e.start >= val[0] && e.end <= val[val.length-1]);
		const includedIds = computed(() => {
			const arr = listSelected.value.map(e => segments.value.map((v) => {
				return getAllIncludes([e.in, e.out].sort((a,b)=>a-b), v.arr).filter(el => el.content).map(el => el.id);
			}));
			return [...new Set(arr.flat(Infinity))];
		});

		const onSubInVideo = (v) => {
			return v.end <= currentTime.value;
		};
		const onCloseModal = () => {
			modalCupSubclips.value.style.display = "none";
		};
		const onChangeCurentTime = (e) => {
			let _a, _b;
			const left = (_a = timeDiv.value) === null || _a === void 0 ? void 0 : _a.getClientRects()[0].left;
			const width = (_b = timeDiv.value) === null || _b === void 0 ? void 0 : _b.offsetWidth;
			const positionCursor = Math.abs(left - e.clientX);
			if (positionCursor < 0 || !isResizeTime.value) {
				return;
			}
			const grabPercent = (100 / width) * positionCursor;
			videoNode.value.currentTime = currentTime.value = maxLenghVideo.value * (grabPercent / 100);
		};
		const loadedData = () => {
			if (!videoNode.value) {
				return;
			}
			maxLenghVideo.value = videoNode.value.duration;
		};
		const timeUpdated = () => {
			if (!videoNode.value) {
				return;
			}
			isPaused.value = videoNode.value.paused;
			isRepeat.value = maxLenghVideo.value === videoNode.value.currentTime;
			currentTime.value = videoNode.value.currentTime;
		};
		const ASCsortListExport = computed(() => {
			return listSelected.value.map(e => {
				e.context = segments.value.map((v) => {
					const framentForReplace = getAllIncludes([e.in, e.out].sort((a,b)=>a-b), v.arr)
						.filter(el => el.content).map(el => el.content).join(' ').replaceAll(' ,', ',').replaceAll(' .', '.');
					return txtCormater(framentForReplace);
				}).filter(e => e);
				return e;
			}).sort((a,b)=>a.in-b.out);
		});
		const getIsTimeCrosses = (val, isGiveVal) => {
			let isTimeCrosses = false;
			let newVal = {};
			listSelected.value.forEach(e => {
				if (!isTimeCrosses && e.in < val.out && e.out > val.in) {
					isTimeCrosses = true;
					newVal.id = e.id;
					newVal.in = [val.in,e.in].sort((a,b)=>a-b)[0];
					newVal.out = [val.out,e.out].sort((a,b)=>b-a)[0];
				}
			});
			return isGiveVal ? newVal : isTimeCrosses;
		};
		const onAddSelected =() => {
			const selected = txtCormater(highlight.value.toString());
			if (['',' ',...arrPunctuations].includes(selected)) {
				return;
			}
			const { baseNode, extentNode } = highlight.value;
			const baseParentNode = baseNode.parentNode.parentNode.children;
			const firstBlock = segments.value.map(v => v.arr).flat(1).filter(v => v.id === baseNode.parentNode.id);
			const lastBlock = segments.value.map(v => v.arr).flat(1).filter(v => {
				if (!extentNode.parentNode.id) {
					return v.id === baseParentNode[baseParentNode.length-1].id;
				} else {
					return v.id === extentNode.parentNode.id;
				}
			});
			const ascTimes = [firstBlock[0].start, lastBlock[0].start, lastBlock[0].end, firstBlock[0].end].sort((a,b)=>a-b);
			const res = {in: ascTimes[0], out: ascTimes[3], name: ''};
			if (getIsTimeCrosses(res)) {
				onRequestUpdate(getIsTimeCrosses(res, true));
			} else {
				onRequestAdd(res);
			}

			onDeselect();
		};
		const onPlay = () => {
			if (videoNode.value.paused) {
				videoNode.value.play();
				return;
			}
			videoNode.value.pause();
		};
		const onStartVideoTime = (v) => {
			videoNode.value.currentTime = v.in;
			onPlay();
		};
		const onRequestDelAll = () => {
			listSelected.value = [];
		};
		const onRequestDel = (key) => {
			if (activeFragment.value === listSelected.value.filter((e, id) => id===key)[0]) {
				activeFragment.value = null;
			}
			listSelected.value = listSelected.value.filter(e => e.id!==key);
		};
		const onRequestUpdate = (v) => {
			const newExportList = listSelected.value.filter(e => +e.in < +v.in || +e.out > +v.out);
			newExportList.push(v);
			const mapNewExportList = newExportList.map(e => {
				const data = { in: ~~(e.in*1000), out: ~~(e.out*1000), name: e.name || "" };
				if (e.name) {
					data.name = e.name;
				}
				return data;
			});
			listSelected.value = mapNewExportList;
		};
		const onRequestAdd = (v) => {
			counterLocal.value++;
			v.id = counterLocal.value;
			listSelected.value.push(v);
		};
		const onGetSpeakerKey = (id) => {
			let index = 0;
			speakers.value.forEach((v, i) => {
				if (v.id === id) index = i;
			});
			return index;
		};
		const parseSegments = (val) => {
			const arr = [];
			for (var i = 0; i < val.length; ++i) {
				if (!arr[0] || arr[arr.length-1].speakerId != val[i].speakerId || val[i].alternatives[0].content === '.') {
					const obj = {
						id: 'node_t'+i,
						content: val[i].alternatives[0].content !== '.' ? val[i].alternatives[0].content : '',
						end: val[i].end,
						start: i === 0 ? val[i].start : arr[arr.length-1].end,
						speakerId: val[i].speakerId,
						arr: [{
							id: 'subnode_t'+i,
							content: val[i].alternatives[0].content,
							start: i === 0 ? val[i].start : arr[arr.length-1].end,
							end: val[i].end,
							type: val[i].type
						}]
					};
					if (val[i].alternatives[0].content === '.') {
						const length = arr[arr.length-1].arr.length;
						arr[arr.length-1].content += val[i].alternatives[0].content;
						arr[arr.length-1].arr[length-1].content += val[i].alternatives[0].content;
						obj.arr = [];
					}
					arr.push(obj);
				} else {
					const symbol = val[i].type !== 'punctuation' ? ' ': '';
					arr[arr.length-1].content += symbol+val[i].alternatives[0].content;
					arr[arr.length-1].content = arr[arr.length-1].content.trim();
					arr[arr.length-1].end = val[i].end;
					arr[arr.length-1].arr.push({
						id: 'subnode_t'+i,
						content: val[i].alternatives[0].content,
						start: val[i].start,
						end: val[i].end,
						type: val[i].type
					});
				}
			}
			return arr;
		};
		const getWidthPosition = (v) => {
			const left = (v.in*100)/maxLenghVideo.value;
			const right = (v.out*100)/maxLenghVideo.value;
			return {width: right-left+'%', marginLeft: left+'%'};
		};
		const onIsActiveFragment = (v) => {
			return activeFragment.value === v;
		};
		const onIsActiveInclude = (id) => {
			return includedIds.value.includes(id);
		};
		const onShowSkeaper = (id) => {
			if (speakerActive.value.id === 'all') return false;
			return speakerActive.value.id !== id;
		};
		const onSearch = (context) => {
			if (!search.value) return false;
			return context.toLocaleLowerCase().indexOf(search.value.toLocaleLowerCase()) < 0;
		};
		const onSetTimeVideo = (v) => {
			videoNode.value.currentTime = v;
		};
		const setActiveFragment = (v, i) => {
			if (activeFragment.value === v) {
				activeFragment.value = null;
				return;
			}
			videoNode.value.currentTime = v.in;
			activeFragment.value = v;
			const getMeToRight = document.getElementById("exp_node_t"+i);
			getMeToRight.scrollIntoView({behavior: 'smooth'}, true);
		};
		const onReset = () => {
			onRequestDelAll();
			onDeselect();
			listSelected.value = [];
			activeFragment.value = null;
		};


		watch([ search, currentTime ], (currentValue, oldValue) => {
			if (currentValue[0] !== oldValue[0]) {
				activeSearch.value = !search.value ? 0 : 1;
			}
			if (currentValue[1] !== oldValue[1]) {
				const indexLeft = segmentsNoEmpty.value.findIndex((e) => e.start >= currentValue[2]);
				const elemRLeft = segmentsNoEmpty.value[indexLeft-1];
				if (elemRLeft) {
					const elemId  = elemRLeft.id;
					setTimeout(() => {
						const getMeToleft = document.getElementById(elemId);
						getMeToleft.scrollIntoView({behavior: 'smooth'}, true);
					}, 750)
				}
			}
		});

		onMounted(async () => {
			const response = await fetch(`/transcription.json`, { ...reqHeaders, method: 'POST' });
			const data = await response.json();
			if (data.transcriptions && data.transcriptions[0].transcription) {
				Object.values(data.transcriptions[0].transcription.speakers).forEach(v => speakers.value.push(v));
				segments.value = parseSegments(data.transcriptions[0].transcription.segments);
			}
		});

		return { listSelected, isPaused, isRepeat, search, videoNode, activeFragment,
			ASCsortListExport, segmentsSearch, segments, speakerActive, speakers, currentTime, activeSearch,
			includedIds, videoLink, segmentsNoEmpty, modalCupSubclips, isSearchActive, timeDiv, isResizeTime,
			onReset, onAddSelected, onRequestDel, onPlay, onSetTimeVideo, onSearch, loadedData, timeUpdated,
			onIsActiveInclude, onStartVideoTime, onGetSpeakerKey, onIsActiveFragment, setActiveFragment,
			onCloseModal, getWidthPosition, onTimeMs, onShowSkeaper, onPrevFind, onNextFind, onSubInVideo, onChangeCurentTime }
	},
};


App.component('v-repeat', playRepeat);
App.component('v-pause', pauseSvg);
App.component('v-play', playSvg);
App.component('v-popup-transcription', transcriptionModal);
App.mount('#vue-popup-transcription');
